import api from "./api";
import { isValidObjectId } from "../utils/validation";

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
  if (!isValidObjectId(id)) {
    throw new Error('Invalid experience ID');
  }
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
  if (!isValidObjectId(id)) {
    throw new Error('Invalid education ID');
  }
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

  if (!isValidObjectId(jobId)) {
    throw new Error('Invalid job ID');
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

export const getUserById = async (id) => {
  if (!id) {
    throw new Error("User ID is required");
  }

  if (!isValidObjectId(id)) {
    throw new Error('Invalid user ID');
  }

  const res = await api.get(
    `/users/id/${id}`
  );

  return res.data;
};