import React, {
  useEffect,
  useState
} from "react";

import { Link } from "react-router-dom";

import {
  Bookmark,
  Search
} from "lucide-react";

import {
  getSavedJobs,
  saveJob
} from "../../services/userService";

import JobCard from "../../components/jobs/JobCard";
import Loader from "../../components/common/Loader";
import Button from "../../components/common/Button";

import "./SavedJobs.css";


const SavedJobs = () => {
  const [savedJobs, setSavedJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);


  /*
  ========================================================
  FETCH SAVED JOBS
  ========================================================
  */

  const fetchSavedJobs = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await getSavedJobs();

      /*
      Backend now returns:

      {
        success: true,
        data: {
          savedJobs: [],
          count: 0
        }
      }
      */

      const jobs =
        response?.data?.savedJobs || [];

      setSavedJobs(
        Array.isArray(jobs)
          ? jobs
          : []
      );
    } catch (error) {
      console.error(
        "Fetch Saved Jobs Error:",
        error
      );

      setError(
        error?.response?.data?.message ||
        "Failed to load saved jobs. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };


  /*
  ========================================================
  INITIAL LOAD
  ========================================================
  */

  useEffect(() => {
    fetchSavedJobs();
  }, []);


  /*
  ========================================================
  UNSAVE JOB
  ========================================================
  */

  const handleUnsave = async (jobId) => {
    try {
      /*
      Backend toggles save/unsave.
      */
      const response =
        await saveJob(jobId);

      /*
      Remove immediately from UI.
      */
      setSavedJobs((previousJobs) =>
        previousJobs.filter(
          (job) =>
            job._id !== jobId
        )
      );

      console.log(
        response?.message ||
        "Job removed from saved list"
      );
    } catch (error) {
      console.error(
        "Unsave Job Error:",
        error
      );

      setError(
        error?.response?.data?.message ||
        "Failed to remove saved job."
      );
    }
  };


  /*
  ========================================================
  LOADING
  ========================================================
  */

  if (loading) {
    return <Loader />;
  }


  /*
  ========================================================
  PAGE
  ========================================================
  */

  return (
    <div className="saved-jobs-page">

      <div className="container saved-jobs-container">

        {/* HEADER */}

        <div className="saved-jobs-header">

          <div>

            <h1>
              Saved Jobs
            </h1>

            <p className="text-muted">

              {savedJobs.length > 0
                ? `${savedJobs.length} saved job${
                    savedJobs.length !== 1
                      ? "s"
                      : ""
                  }`
                : "Jobs you've bookmarked for later."}

            </p>

          </div>


          <Link
            to="/jobs"
            className="btn btn--outline btn--md"
          >

            <Search size={16} />

            Find More Jobs

          </Link>

        </div>


        {/* ERROR */}

        {error && (
          <div
            className="saved-jobs-error"
            role="alert"
          >
            {error}
          </div>
        )}


        {/* SAVED JOBS */}

        {savedJobs.length > 0 ? (

          <div className="saved-jobs-grid">

            {savedJobs.map((job) => (

              <JobCard
                key={job._id}
                job={job}
                isSaved={true}
                onSave={handleUnsave}
              />

            ))}

          </div>

        ) : (

          /* EMPTY STATE */

          <div className="saved-jobs-empty">

            <Bookmark
              size={48}
              className="saved-empty-icon"
            />

            <h3>
              No Saved Jobs Yet
            </h3>

            <p>
              When you see a job you like,
              click the bookmark icon to save
              it here.
            </p>

            <Button
              onClick={() => {
                window.location.href =
                  "/jobs";
              }}
            >
              Browse Jobs
            </Button>

          </div>

        )}

      </div>

    </div>
  );
};


export default SavedJobs;