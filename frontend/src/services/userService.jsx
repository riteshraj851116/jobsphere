import api from "./api";
import { DEMO_CANDIDATE, MOCK_JOBS } from "../utils/mockData";

const STORAGE_SAVED_KEY = "jobsphere_local_saved_jobs";

const getLocalSavedJobs = () => {
  try {
    const raw = localStorage.getItem(STORAGE_SAVED_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error(e);
  }
  return [MOCK_JOBS[0], MOCK_JOBS[2]];
};

const saveLocalSavedJobs = (jobs) => {
  try {
    localStorage.setItem(STORAGE_SAVED_KEY, JSON.stringify(jobs));
  } catch (e) {
    console.error(e);
  }
};

export const getMyProfile = async () => {
  try {
    const res = await api.get("/users/me");
    return res.data;
  } catch (error) {
    const stored = JSON.parse(localStorage.getItem("user") || "null") || DEMO_CANDIDATE;
    return { success: true, data: stored, user: stored };
  }
};

export const updateProfile = async (data) => {
  try {
    const res = await api.put("/users/profile", data);
    return res.data;
  } catch (error) {
    const stored = JSON.parse(localStorage.getItem("user") || "null") || DEMO_CANDIDATE;
    const updated = { ...stored, ...data };
    localStorage.setItem("user", JSON.stringify(updated));
    return { success: true, data: updated, user: updated };
  }
};

export const updateSkills = async (skills) => {
  try {
    const res = await api.put("/users/skills", { skills });
    return res.data;
  } catch (error) {
    const stored = JSON.parse(localStorage.getItem("user") || "null") || DEMO_CANDIDATE;
    const updated = { ...stored, skills };
    localStorage.setItem("user", JSON.stringify(updated));
    return { success: true, data: updated, user: updated };
  }
};

export const addExperience = async (data) => {
  try {
    const res = await api.post("/users/experience", data);
    return res.data;
  } catch (error) {
    const stored = JSON.parse(localStorage.getItem("user") || "null") || DEMO_CANDIDATE;
    const exp = stored.experience || [];
    const newExp = { _id: "exp-" + Date.now(), ...data };
    const updated = { ...stored, experience: [newExp, ...exp] };
    localStorage.setItem("user", JSON.stringify(updated));
    return { success: true, data: updated, user: updated };
  }
};

export const deleteExperience = async (id) => {
  try {
    const res = await api.delete(`/users/experience/${id}`);
    return res.data;
  } catch (error) {
    const stored = JSON.parse(localStorage.getItem("user") || "null") || DEMO_CANDIDATE;
    const exp = (stored.experience || []).filter((e) => e._id !== id && e.id !== id);
    const updated = { ...stored, experience: exp };
    localStorage.setItem("user", JSON.stringify(updated));
    return { success: true, data: updated, user: updated };
  }
};

export const addEducation = async (data) => {
  try {
    const res = await api.post("/users/education", data);
    return res.data;
  } catch (error) {
    const stored = JSON.parse(localStorage.getItem("user") || "null") || DEMO_CANDIDATE;
    const edu = stored.education || [];
    const newEdu = { _id: "edu-" + Date.now(), ...data };
    const updated = { ...stored, education: [newEdu, ...edu] };
    localStorage.setItem("user", JSON.stringify(updated));
    return { success: true, data: updated, user: updated };
  }
};

export const deleteEducation = async (id) => {
  try {
    const res = await api.delete(`/users/education/${id}`);
    return res.data;
  } catch (error) {
    const stored = JSON.parse(localStorage.getItem("user") || "null") || DEMO_CANDIDATE;
    const edu = (stored.education || []).filter((e) => e._id !== id && e.id !== id);
    const updated = { ...stored, education: edu };
    localStorage.setItem("user", JSON.stringify(updated));
    return { success: true, data: updated, user: updated };
  }
};

export const saveJob = async (jobId) => {
  try {
    const res = await api.post(`/users/save-job/${jobId}`);
    return res.data;
  } catch (error) {
    const saved = getLocalSavedJobs();
    const exists = saved.some((j) => (j._id === jobId || j.id === jobId || j === jobId));
    let updated;
    let isSavedNow = false;

    if (exists) {
      updated = saved.filter((j) => (j._id !== jobId && j.id !== jobId && j !== jobId));
      isSavedNow = false;
    } else {
      const match = MOCK_JOBS.find((j) => j._id === jobId || j.id === jobId) || { _id: jobId, title: "Software Engineer" };
      updated = [match, ...saved];
      isSavedNow = true;
    }

    saveLocalSavedJobs(updated);
    return { success: true, isSaved: isSavedNow, savedJobs: updated };
  }
};

export const getSavedJobs = async () => {
  try {
    const res = await api.get("/users/saved-jobs");
    return res.data;
  } catch (error) {
    const saved = getLocalSavedJobs();
    return { success: true, data: { savedJobs: saved }, savedJobs: saved };
  }
};

export const getUserProfile = async (username) => {
  try {
    const res = await api.get(`/users/${username}`);
    return res.data;
  } catch (error) {
    return { success: true, data: DEMO_CANDIDATE, user: DEMO_CANDIDATE };
  }
};

export const getUserById = async (id) => {
  try {
    const res = await api.get(`/users/id/${id}`);
    return res.data;
  } catch (error) {
    return { success: true, data: DEMO_CANDIDATE, user: DEMO_CANDIDATE };
  }
};

const userService = {
  getMyProfile,
  updateProfile,
  updateSkills,
  addExperience,
  deleteExperience,
  addEducation,
  deleteEducation,
  saveJob,
  getSavedJobs,
  getUserProfile,
  getUserById,
};

export default userService;