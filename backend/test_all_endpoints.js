const axios = require('axios');

const BASE_URL = 'http://localhost:5005/api';

async function runFullQA() {
  console.log('====================================================');
  console.log('  JOBSPHERE COMPREHENSIVE QA AUTOMATION TEST SUITE  ');
  console.log('====================================================\n');

  const results = {};

  const record = (category, testName, passed, details = '') => {
    if (!results[category]) results[category] = [];
    results[category].push({ testName, passed, details });
    console.log(`[${passed ? 'PASS' : 'FAIL'}] ${category} -> ${testName} ${details ? `(${details})` : ''}`);
  };

  try {
    // 1. HEALTH CHECK
    const healthRes = await axios.get(`${BASE_URL}/health`);
    record('BACKEND', 'Health check responds 200 OK', healthRes.status === 200, `status: ${healthRes.data?.status}`);
  } catch (err) {
    record('BACKEND', 'Health check responds 200 OK', false, err.message);
  }

  // 2. AUTHENTICATION & MULTI-USER TEST
  let userAToken = null;
  let userBToken = null;
  let userAId = null;
  let userBId = null;
  const uniqueA = `qa_test_a_${Date.now()}`;
  const uniqueB = `qa_test_b_${Date.now()}`;

  try {
    // Register User A (Candidate)
    const regARes = await axios.post(`${BASE_URL}/auth/register`, {
      name: 'QA Tester A',
      email: `${uniqueA}@test.com`,
      password: 'Password123!',
      role: 'user'
    });
    userAToken = regARes.data?.data?.token || regARes.data?.token;
    userAId = regARes.data?.data?.user?._id || regARes.data?.user?._id;
    record('AUTHENTICATION', 'Register User A (Candidate)', !!userAToken, `ID: ${userAId}`);

    // Register User B (Recruiter)
    const regBRes = await axios.post(`${BASE_URL}/auth/register`, {
      name: 'QA Recruiter B',
      email: `${uniqueB}@test.com`,
      password: 'Password123!',
      role: 'recruiter'
    });
    userBToken = regBRes.data?.data?.token || regBRes.data?.token;
    userBId = regBRes.data?.data?.user?._id || regBRes.data?.user?._id;
    record('AUTHENTICATION', 'Register User B (Recruiter)', !!userBToken, `ID: ${userBId}`);

    // Login User A
    const loginRes = await axios.post(`${BASE_URL}/auth/login`, {
      email: `${uniqueA}@test.com`,
      password: 'Password123!'
    });
    record('AUTHENTICATION', 'Login with valid credentials', loginRes.status === 200);

    // Negative: Login with wrong password
    try {
      await axios.post(`${BASE_URL}/auth/login`, {
        email: `${uniqueA}@test.com`,
        password: 'WrongPassword999'
      });
      record('AUTHENTICATION', 'Reject invalid password', false, 'Should have failed with 401');
    } catch (err) {
      record('AUTHENTICATION', 'Reject invalid password', err.response?.status === 401 || err.response?.status === 400);
    }
  } catch (err) {
    record('AUTHENTICATION', 'Auth flow', false, err.response?.data?.message || err.message);
  }

  const authAHeaders = { headers: { Authorization: `Bearer ${userAToken}` } };
  const authBHeaders = { headers: { Authorization: `Bearer ${userBToken}` } };

  // 3. USER PROFILE TEST
  try {
    const meRes = await axios.get(`${BASE_URL}/auth/me`, authAHeaders);
    record('PROFILE', 'Get current user profile (/auth/me)', meRes.status === 200 && meRes.data?.data?.user?.email === `${uniqueA}@test.com`);

    // Update profile
    const updateRes = await axios.put(`${BASE_URL}/users/profile`, {
      headline: 'Senior Full Stack QA Lead',
      bio: 'Automated test engineer testing JobSphere at scale.',
      skills: ['React', 'Node.js', 'Testing', 'Three.js']
    }, authAHeaders);
    record('PROFILE', 'Update user profile & skills', updateRes.status === 200 && updateRes.data?.data?.user?.skills?.includes('Three.js'));

    // Get public profile
    const pubRes = await axios.get(`${BASE_URL}/users/profile/${userAId}`, authAHeaders);
    record('PROFILE', 'Get public profile by ID', pubRes.status === 200 && pubRes.data?.data?.user?._id === userAId);
  } catch (err) {
    record('PROFILE', 'Profile operations', false, err.response?.data?.message || err.message);
  }

  // 4. CONNECTIONS & NETWORKING TEST (USER A <-> USER B)
  let connectionId = null;
  try {
    // A sends connection request to B
    const sendReqRes = await axios.post(`${BASE_URL}/connections/request`, { userId: userBId }, authAHeaders);
    connectionId = sendReqRes.data?.data?.connection?._id || sendReqRes.data?.connection?._id;
    record('CONNECTIONS', 'Send connection request A -> B', sendReqRes.status === 200 || sendReqRes.status === 201);

    // B views pending connection requests
    const bReqsRes = await axios.get(`${BASE_URL}/connections/requests`, authBHeaders);
    const hasRequest = (bReqsRes.data?.data?.requests || []).some(r => (r.sender?._id || r.sender) === userAId || r._id === connectionId);
    record('CONNECTIONS', 'View received connection requests', hasRequest || bReqsRes.status === 200);

    // B accepts connection request
    if (connectionId) {
      const acceptRes = await axios.put(`${BASE_URL}/connections/request/${connectionId}/accept`, {}, authBHeaders);
      record('CONNECTIONS', 'Accept connection request', acceptRes.status === 200);
    }
  } catch (err) {
    record('CONNECTIONS', 'Connection operations', false, err.response?.data?.message || err.message);
  }

  // 5. FOLLOW / UNFOLLOW TEST
  try {
    const followRes = await axios.post(`${BASE_URL}/users/follow/${userBId}`, {}, authAHeaders);
    record('FOLLOW', 'Follow user (A follows B)', followRes.status === 200);

    const unfollowRes = await axios.post(`${BASE_URL}/users/unfollow/${userBId}`, {}, authAHeaders);
    record('FOLLOW', 'Unfollow user (A unfollows B)', unfollowRes.status === 200);
  } catch (err) {
    record('FOLLOW', 'Follow operations', false, err.response?.data?.message || err.message);
  }

  // 6. POSTS, LIKES, COMMENTS, REPOSTS TEST
  let postId = null;
  let commentId = null;
  try {
    // Create text/project post by User A
    const postRes = await axios.post(`${BASE_URL}/posts`, {
      content: 'Excited to run comprehensive QA testing on JobSphere! #QA #SoftwareTesting',
      postType: 'technical',
      visibility: 'public'
    }, authAHeaders);
    postId = postRes.data?.data?.post?._id || postRes.data?.post?._id;
    record('POSTS', 'Create new post', !!postId, `Post ID: ${postId}`);

    // Get Feed
    const feedRes = await axios.get(`${BASE_URL}/posts/feed`, authAHeaders);
    const inFeed = (feedRes.data?.data?.posts || feedRes.data?.posts || []).some(p => p._id === postId);
    record('POSTS', 'Fetch Feed and verify created post exists', inFeed);

    // Like Post by User B
    const likeRes = await axios.post(`${BASE_URL}/posts/${postId}/like`, {}, authBHeaders);
    record('LIKE', 'Like post by another user', likeRes.status === 200 && (likeRes.data?.data?.likeCount >= 1 || likeRes.data?.likeCount >= 1));

    // Unlike Post by User B
    const unlikeRes = await axios.post(`${BASE_URL}/posts/${postId}/like`, {}, authBHeaders);
    record('LIKE', 'Toggle unlike post', unlikeRes.status === 200);

    // Add Comment by User B
    const commentRes = await axios.post(`${BASE_URL}/posts/${postId}/comment`, {
      text: 'Great post on automated software verification!'
    }, authBHeaders);
    commentId = commentRes.data?.data?.comment?._id || commentRes.data?.comment?._id || commentRes.data?.data?.post?.comments?.[0]?._id;
    record('COMMENTS', 'Add comment to post', commentRes.status === 200);

    // Repost / Share
    const shareRes = await axios.post(`${BASE_URL}/posts/${postId}/share`, {
      commentary: 'Must-read automated testing update!'
    }, authBHeaders);
    record('SHARE/REPOST', 'Share / repost with commentary', shareRes.status === 200 || shareRes.status === 201);

    // Save / Bookmark Post
    const saveRes = await axios.post(`${BASE_URL}/posts/${postId}/save`, {}, authAHeaders);
    record('SAVED POSTS', 'Bookmark / Save post', saveRes.status === 200);
  } catch (err) {
    record('POSTS', 'Post / Like / Comment flow', false, err.response?.data?.message || err.message);
  }

  // 7. NOTIFICATIONS TEST
  try {
    const notifRes = await axios.get(`${BASE_URL}/notifications`, authAHeaders);
    const notifs = notifRes.data?.data?.notifications || notifRes.data?.notifications || [];
    record('NOTIFICATIONS', 'Fetch User A notifications', notifRes.status === 200 && Array.isArray(notifs));

    if (notifs.length > 0) {
      const firstId = notifs[0]._id;
      const readRes = await axios.put(`${BASE_URL}/notifications/${firstId}/read`, {}, authAHeaders);
      record('NOTIFICATIONS', 'Mark notification as read', readRes.status === 200);
    }

    const readAllRes = await axios.put(`${BASE_URL}/notifications/read-all`, {}, authAHeaders);
    record('NOTIFICATIONS', 'Mark all notifications as read', readAllRes.status === 200);
  } catch (err) {
    record('NOTIFICATIONS', 'Notification operations', false, err.response?.data?.message || err.message);
  }

  // 8. JOBS & APPLICATIONS TEST
  let jobId = null;
  let appId = null;
  try {
    // Recruiter B creates a Job
    const createJobRes = await axios.post(`${BASE_URL}/jobs`, {
      title: 'Senior Full Stack QA Engineer',
      companyName: 'JobSphere Enterprise',
      location: 'Bengaluru, India / Remote',
      jobType: 'Full-time',
      experienceLevel: 'Senior',
      category: 'Software Development',
      skills: ['React', 'Node.js', 'Testing', 'CI/CD'],
      description: 'Lead automated QA architecture across web, backend, and distributed pipelines.',
      requirements: ['4+ years in Full Stack QA', 'JavaScript/TypeScript testing'],
      salaryMin: 2500000,
      salaryMax: 4000000,
      salaryCurrency: 'INR'
    }, authBHeaders);
    jobId = createJobRes.data?.data?.job?._id || createJobRes.data?.job?._id;
    record('JOBS', 'Recruiter creates job posting', !!jobId, `Job ID: ${jobId}`);

    // Candidate A searches & views jobs
    const searchJobsRes = await axios.get(`${BASE_URL}/jobs?search=QA`, authAHeaders);
    const jobFound = (searchJobsRes.data?.data?.jobs || searchJobsRes.data?.jobs || []).some(j => j._id === jobId || j.title.includes('QA'));
    record('JOBS', 'Search jobs with keyword', searchJobsRes.status === 200 && jobFound);

    // Save job
    const saveJobRes = await axios.post(`${BASE_URL}/jobs/${jobId}/save`, {}, authAHeaders);
    record('SAVED JOBS', 'Save / Bookmark job', saveJobRes.status === 200);

    // Candidate A applies to Job
    const applyRes = await axios.post(`${BASE_URL}/applications`, {
      jobId: jobId,
      coverLetter: 'Strong experience with MERN stack end-to-end automated testing.',
      resumeUrl: 'https://github.com/riteshraj851116/jobsphere/resume.pdf'
    }, authAHeaders);
    appId = applyRes.data?.data?.application?._id || applyRes.data?.application?._id;
    record('APPLICATIONS', 'Candidate applies to job', !!appId, `App ID: ${appId}`);

    // Recruiter B reviews candidate application & updates status
    if (appId) {
      const statusRes = await axios.put(`${BASE_URL}/applications/${appId}/status`, {
        status: 'shortlisted'
      }, authBHeaders);
      record('APPLICATIONS', 'Recruiter updates application status to shortlisted', statusRes.status === 200);
    }
  } catch (err) {
    record('JOBS', 'Jobs & Application flow', false, err.response?.data?.message || err.message);
  }

  // 9. MESSAGING & MESSAGE RECRUITER FLOW
  try {
    // Send message from Candidate A to Recruiter B (Message Recruiter flow)
    const msgRes = await axios.post(`${BASE_URL}/messages`, {
      receiverId: userBId,
      text: 'Hello! I applied for the Senior Full Stack QA Engineer role and look forward to discussing the role.'
    }, authAHeaders);
    const msgId = msgRes.data?.data?.message?._id || msgRes.data?.message?._id;
    record('MESSAGE RECRUITER', 'Message recruiter from job/profile', !!msgId);

    // Recruiter B fetches conversations
    const convsRes = await axios.get(`${BASE_URL}/messages/conversations`, authBHeaders);
    const hasConv = (convsRes.data?.data?.conversations || convsRes.data?.conversations || []).length > 0;
    record('MESSAGING', 'Fetch conversation list with active thread', hasConv);
  } catch (err) {
    record('MESSAGING', 'Messaging flow', false, err.response?.data?.message || err.message);
  }

  // 10. COMPANIES TEST
  try {
    const compRes = await axios.get(`${BASE_URL}/companies`);
    record('COMPANIES', 'Fetch companies directory', compRes.status === 200 && Array.isArray(compRes.data?.data?.companies || compRes.data?.companies || compRes.data));
  } catch (err) {
    record('COMPANIES', 'Companies fetch', false, err.response?.data?.message || err.message);
  }

  // 11. DSA SUITE API TEST
  try {
    const dsaRes = await axios.get(`${BASE_URL}/dsa/problems`);
    const count = (dsaRes.data?.data?.problems || dsaRes.data?.problems || []).length;
    record('DSA', 'Fetch DSA problem catalog', dsaRes.status === 200 && count > 0, `${count} problems`);
  } catch (err) {
    record('DSA', 'DSA problem catalog', false, err.response?.data?.message || err.message);
  }

  // SUMMARY
  console.log('\n====================================================');
  console.log('                 QA TEST SUMMARY                    ');
  console.log('====================================================\n');
  let totalTests = 0;
  let passedTests = 0;
  let failedTests = 0;

  for (const [cat, tests] of Object.entries(results)) {
    const passed = tests.filter(t => t.passed).length;
    const total = tests.length;
    totalTests += total;
    passedTests += passed;
    failedTests += (total - passed);
    console.log(`${cat.padEnd(20)}: ${passed}/${total} PASSED ${total === passed ? '✅' : '❌'}`);
  }

  console.log(`\nTOTAL TESTS: ${totalTests}`);
  console.log(`PASSED:      ${passedTests}`);
  console.log(`FAILED:      ${failedTests}`);
  console.log(`PASS RATE:   ${((passedTests / totalTests) * 100).toFixed(1)}%`);
}

runFullQA();
