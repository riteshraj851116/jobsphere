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

      /*
      De-duplicate by _id so a repeated populate/expand
      or duplicated backend entry cannot render the same
      job twice (React duplicate-key guard).
      */

      const uniqueJobs = [];
      const seenIds = new Set();

      for (const job of Array.isArray(jobs) ? jobs : []) {
        const id = job?._id?.toString?.() || job?._id;
        if (!id || seenIds.has(id)) {
          continue;
        }
        seenIds.add(id);
        uniqueJobs.push(job);
      }

      setSavedJobs(uniqueJobs);
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

  const handleUnsave = (jobId, isNowSaved) => {
    if (!isNowSaved) {
      setSavedJobs((previousJobs) =>
        previousJobs.filter(
          (job) => job._id !== jobId
        )
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

            <Link
              to="/jobs"
              className="btn btn--primary btn--md"
            >
              Browse Jobs
            </Link>

          </div>

        )}

      </div>

    </div>
  );
};


export default SavedJobs;