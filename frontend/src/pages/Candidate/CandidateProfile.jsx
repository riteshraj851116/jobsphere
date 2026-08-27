import React, { useEffect, useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import {
  getMyProfile,
  updateProfile,
  updateSkills
} from '../../services/userService';

import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import Loader from '../../components/common/Loader';

import { MapPin, Briefcase } from 'lucide-react';

import SkillConstellation from '../../components/three/SkillConstellation';

import './CandidateProfile.css';

const CandidateProfile = () => {
  const { setUser } = useAuth();

  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    headline: '',
    location: '',
    bio: '',
    skills: '',
    resume: ''
  });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      setError('');

      const res = await getMyProfile();

      const userData =
        res?.data?.user ||
        res?.user ||
        res?.data ||
        res;

      if (!userData) {
        throw new Error('Profile data not found');
      }

      setProfile(userData);

      setFormData({
        name: userData.name || '',
        headline: userData.headline || '',
        location: userData.location || '',
        bio: userData.bio || userData.about || '',
        skills: Array.isArray(userData.skills)
          ? userData.skills.join(', ')
          : '',
        resume: userData.resume || ''
      });
    } catch (err) {
      console.error('Profile loading error:', err);

      setError(
        err?.response?.data?.message ||
        err?.message ||
        'Failed to load profile data.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError('');
    setSuccess('');

    try {
      setSaving(true);

      const profileData = {
        name: formData.name.trim(),
        headline: formData.headline.trim(),
        location: formData.location.trim(),
        bio: formData.bio.trim(),
        resume: formData.resume.trim()
      };

      await updateProfile(profileData);

      const skills = formData.skills
        .split(',')
        .map((skill) => skill.trim())
        .filter(Boolean);

      await updateSkills(skills);

      const refreshed = await getMyProfile();

      const updatedUser =
        refreshed?.data?.user ||
        refreshed?.user ||
        refreshed?.data ||
        refreshed;

      setProfile(updatedUser);

      if (setUser) {
        setUser(updatedUser);
      }

      setFormData({
        name: updatedUser?.name || '',
        headline: updatedUser?.headline || '',
        location: updatedUser?.location || '',
        bio: updatedUser?.bio || updatedUser?.about || '',
        skills: Array.isArray(updatedUser?.skills)
          ? updatedUser.skills.join(', ')
          : '',
        resume: updatedUser?.resume || ''
      });

      setSuccess('Profile updated successfully!');
    } catch (err) {
      console.error('Profile update error:', err);

      setError(
        err?.response?.data?.message ||
        err?.message ||
        'Failed to update profile.'
      );
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <Loader />;
  }

  return (
    <div className="candidate-profile-page bg-surface-soft">
      <div className="container py-8 max-w-4xl">

        <div className="mb-6">
          <h2>My Profile</h2>

          <p className="text-muted">
            Manage your personal information, skills, and resume.
          </p>
        </div>

        {error && (
          <div className="error-alert mb-6">
            {error}
          </div>
        )}

        {success && (
          <div className="success-banner mb-6">
            {success}
          </div>
        )}

        <div className="profile-layout">

          {/* PROFILE SIDEBAR */}
          <aside className="profile-sidebar card text-center">

            <div className="profile-avatar-large mx-auto">
              {profile?.name?.charAt(0)?.toUpperCase() || 'U'}
            </div>

            <h3 className="mt-4 text-xl">
              {profile?.name || 'User'}
            </h3>

            <p className="text-muted mb-4">
              {profile?.email || ''}
            </p>

            <div className="profile-quick-info text-left mt-6 pt-6 border-t border-border-light">

              <div className="info-row">
                <Briefcase size={16} />

                <span>
                  {profile?.headline || 'No headline'}
                </span>
              </div>

              <div className="info-row">
                <MapPin size={16} />

                <span>
                  {profile?.location || 'No location set'}
                </span>
              </div>

            </div>

            {/* SKILL CONSTELLATION */}
            <div className="mt-4 text-left">

              <span className="text-xs font-semibold text-muted block mb-2">
                SKILL CONSTELLATION
              </span>

              <div
                style={{
                  width: '100%',
                  minHeight: '240px',
                  position: 'relative',
                  overflow: 'hidden',
                  borderRadius: '12px'
                }}
              >
                <SkillConstellation
                  skills={
                    Array.isArray(profile?.skills)
                      ? profile.skills
                      : []
                  }
                />
              </div>

            </div>

            {/* SKILLS */}
            {Array.isArray(profile?.skills) &&
              profile.skills.length > 0 && (

                <div className="skills-badge-list mt-4 text-left">

                  <span className="text-xs font-semibold text-muted block mb-2">
                    SKILLS
                  </span>

                  <div className="flex flex-wrap gap-1">

                    {profile.skills.map((skill, index) => (
                      <span
                        key={`${skill}-${index}`}
                        className="skill-chip"
                      >
                        {skill}
                      </span>
                    ))}

                  </div>

                </div>
              )}

          </aside>

          {/* PROFILE FORM */}
          <main className="profile-main card">

            <h3>Basic Information</h3>

            <form
              onSubmit={handleSubmit}
              className="profile-form mt-4"
            >

              <div className="form-grid">

                <Input
                  label="Full Name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                />

                <Input
                  label="Professional Headline"
                  name="headline"
                  placeholder="e.g. Senior Frontend Developer"
                  value={formData.headline}
                  onChange={handleChange}
                />

              </div>

              <div className="form-grid">

                <Input
                  label="Location"
                  name="location"
                  placeholder="City, State, Country"
                  value={formData.location}
                  onChange={handleChange}
                />

                <Input
                  label="Resume URL / Link"
                  name="resume"
                  placeholder="e.g. https://drive.google.com/your-resume.pdf"
                  value={formData.resume}
                  onChange={handleChange}
                />

              </div>

              <div className="input-group">

                <Input
                  label="Skills (comma-separated)"
                  name="skills"
                  placeholder="e.g. React, Node.js, TypeScript, MongoDB"
                  value={formData.skills}
                  onChange={handleChange}
                />

              </div>

              <div className="input-group">

                <label className="input-label">
                  Bio / About
                </label>

                <textarea
                  name="bio"
                  className="form-textarea"
                  rows="4"
                  placeholder="Tell employers about yourself..."
                  value={formData.bio}
                  onChange={handleChange}
                />

              </div>

              <div className="form-actions mt-4">

                <Button
                  type="submit"
                  disabled={saving}
                >
                  {saving ? 'Saving...' : 'Save Changes'}
                </Button>

              </div>

            </form>

          </main>

        </div>
      </div>
    </div>
  );
};

export default CandidateProfile;