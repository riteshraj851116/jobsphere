import api from "./api";

export const getMyProfile = async () => {
  const res = await api.get("/users/me");
  return res.data;
};

export const updateProfile = async (data) => {
  const res = await api.put("/users/profile", data);
  return res.data;
};

export const updateSkills = async (skills) => {
  const res = await api.put("/users/skills", {
    skills
  });

  return res.data;
};

export const addExperience = async (data) => {
  const res = await api.post(
    "/users/experience",
    data
  );

  return res.data;
};

export const deleteExperience = async (id) => {
  const res = await api.delete(
    `/users/experience/${id}`
  );

  return res.data;
};

export const addEducation = async (data) => {
  const res = await api.post(
    "/users/education",
    data
  );

  return res.data;
};

export const deleteEducation = async (id) => {
  const res = await api.delete(
    `/users/education/${id}`
  );

  return res.data;
};

/*
 * SAVE / UNSAVE JOB
 *
 * Same endpoint handles both:
 *
 * POST /users/save-job/:jobId
 *
 * Backend toggles the job.
 */
export const saveJob = async (jobId) => {
  if (!jobId) {
    throw new Error("Job ID is required");
  }

  const res = await api.post(
    `/users/save-job/${jobId}`
  );

  return res.data;
};

/*
 * GET ALL SAVED JOBS
 */
export const getSavedJobs = async () => {
  const res = await api.get(
    "/users/saved-jobs"
  );

  return res.data;
};

export const getUserProfile = async (
  username
) => {
  const res = await api.get(
    `/users/${username}`
  );

  return res.data;
};