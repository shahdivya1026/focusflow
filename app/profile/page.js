"use client";

import { useEffect, useState } from "react";

import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
import AuthGuard from "../components/AuthGuard";

const accountTypes = [
  "Student",
  "Professional",
  "Developer",
  "Teacher",
  "Other",
];

export default function ProfilePage() {
  const [user, setUser] = useState(null);

  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [saving, setSaving] = useState(false);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [profilePicture, setProfilePicture] =
    useState("");
  const [accountType, setAccountType] =
    useState("Student");

  const [imagePreview, setImagePreview] =
    useState("");

  const [accountActionLoading, setAccountActionLoading] =
    useState(false);

  useEffect(() => {
    async function fetchUser() {
      try {
        const response = await fetch(
          "/api/auth/me"
        );

        const data = await response.json();

        if (response.ok) {
          setUser(data.user);

          setName(data.user.name || "");
          setEmail(data.user.email || "");

          setProfilePicture(
            data.user.profilePicture || ""
          );

          setImagePreview(
            data.user.profilePicture || ""
          );

          setAccountType(
            data.user.accountType || "Student"
          );
        }
      } catch (error) {
        console.error(
          "Failed to fetch profile:",
          error
        );
      } finally {
        setLoading(false);
      }
    }

    fetchUser();
  }, []);

  function handleEdit() {
    setName(user.name || "");
    setEmail(user.email || "");

    setProfilePicture(
      user.profilePicture || ""
    );

    setImagePreview(
      user.profilePicture || ""
    );

    setAccountType(
      user.accountType || "Student"
    );

    setEditMode(true);
  }

  function handleCancelEdit() {
    setName(user.name || "");
    setEmail(user.email || "");

    setProfilePicture(
      user.profilePicture || ""
    );

    setImagePreview(
      user.profilePicture || ""
    );

    setAccountType(
      user.accountType || "Student"
    );

    setEditMode(false);
  }

  function handleImageUpload(event) {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    if (!file.type.startsWith("image/")) {
      alert("Please select an image file.");
      return;
    }

    const reader = new FileReader();

    reader.onload = function () {
      const imageData = reader.result;

      setProfilePicture(imageData);
      setImagePreview(imageData);
    };

    reader.readAsDataURL(file);
  }

  function handleImageUrlChange(event) {
    const value = event.target.value;

    setProfilePicture(value);
    setImagePreview(value);
  }

  function removeProfilePicture() {
    setProfilePicture("");
    setImagePreview("");
  }

  async function handleSaveProfile() {
    if (!name.trim()) {
      alert("Please enter your name.");
      return;
    }

    if (!email.trim()) {
      alert("Please enter your email.");
      return;
    }

    if (!accountType) {
      alert("Please select an account type.");
      return;
    }

    try {
      setSaving(true);

      const response = await fetch(
        "/api/profile",
        {
          method: "PUT",

          headers: {
            "Content-Type":
              "application/json",
          },

          body: JSON.stringify({
            name: name.trim(),
            email: email.trim(),
            profilePicture:
              profilePicture.trim() || null,
            accountType,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        alert(
          data.error ||
            "Failed to update profile."
        );

        return;
      }

      setUser(data.user);

      setName(data.user.name || "");
      setEmail(data.user.email || "");

      setProfilePicture(
        data.user.profilePicture || ""
      );

      setImagePreview(
        data.user.profilePicture || ""
      );

      setAccountType(
        data.user.accountType || "Student"
      );

      setEditMode(false);

      alert(
        "Profile updated successfully."
      );
    } catch (error) {
      console.error(
        "Profile update error:",
        error
      );

      alert(
        "Something went wrong while updating your profile."
      );
    } finally {
      setSaving(false);
    }
  }

  function formatDate(dateString) {
    if (!dateString) {
      return "Not available";
    }

    return new Date(
      dateString
    ).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  }

  function formatLastLogin(dateString) {
    if (!dateString) {
      return "Not available";
    }

    return new Date(
      dateString
    ).toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  async function handleDeactivateAccount() {
    const confirmed = window.confirm(
      "Are you sure you want to deactivate your account?\n\nYou will be logged out and you will not be able to log in until the account is reactivated."
    );

    if (!confirmed) {
      return;
    }

    try {
      setAccountActionLoading(true);

      const response = await fetch(
        "/api/account",
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json",
          },

          body: JSON.stringify({
            action: "deactivate",
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        alert(
          data.error ||
            "Failed to deactivate your account."
        );

        return;
      }

      alert(
        "Your account has been deactivated."
      );

      window.location.href = "/login";
    } catch (error) {
      console.error(
        "Deactivate account error:",
        error
      );

      alert(
        "Something went wrong while deactivating your account."
      );
    } finally {
      setAccountActionLoading(false);
    }
  }

  async function handleDeleteAccount() {
    const confirmed = window.confirm(
      "WARNING: This will permanently delete your FocuseMate account and its associated data.\n\nThis action cannot be undone.\n\nAre you sure you want to continue?"
    );

    if (!confirmed) {
      return;
    }

    const finalConfirmation = window.confirm(
      "Final confirmation:\n\nPermanently delete your account?"
    );

    if (!finalConfirmation) {
      return;
    }

    try {
      setAccountActionLoading(true);

      const response = await fetch(
        "/api/account",
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json",
          },

          body: JSON.stringify({
            action: "delete",
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        alert(
          data.error ||
            "Failed to delete your account."
        );

        return;
      }

      alert(
        "Your account has been permanently deleted."
      );

      window.location.href = "/login";
    } catch (error) {
      console.error(
        "Delete account error:",
        error
      );

      alert(
        "Something went wrong while deleting your account."
      );
    } finally {
      setAccountActionLoading(false);
    }
  }

  return (
    <AuthGuard>
      <main>
        <div className="dashboard-layout">

          <Sidebar />

          <div className="dashboard-content">

            <Header />

            <div className="profile-page">

              <div className="profile-page-header">
                <p className="profile-page-label">
                  ACCOUNT
                </p>

                <h1>My Profile</h1>

                <p>
                  Manage your personal information
                  and account details.
                </p>
              </div>

              {loading ? (
                <div className="profile-loading">
                  Loading profile...
                </div>
              ) : user ? (
                <div className="profile-card">

                  <div className="profile-card-top">

                    <div className="profile-large-avatar">

                      {user.profilePicture ? (
                        <img
                          src={
                            user.profilePicture
                          }
                          alt={user.name}
                        />
                      ) : (
                        user.name
                          ? user.name
                              .charAt(0)
                              .toUpperCase()
                          : "U"
                      )}

                    </div>

                    <div className="profile-main-info">

                      <h2>
                        {user.name}
                      </h2>

                      <p>
                        {user.email}
                      </p>

                      <span className="profile-role-badge">
                        {user.accountType ||
                          "Student"}
                      </span>

                    </div>

                  </div>

                  <div className="profile-divider"></div>

                  {editMode ? (
                    <div className="profile-edit-form">

                      <div className="profile-form-field">

                        <label>
                          Full Name
                        </label>

                        <input
                          type="text"
                          value={name}
                          onChange={(event) =>
                            setName(
                              event.target.value
                            )
                          }
                          placeholder="Enter your full name"
                        />

                      </div>

                      <div className="profile-form-field">

                        <label>
                          Email Address
                        </label>

                        <input
                          type="email"
                          value={email}
                          onChange={(event) =>
                            setEmail(
                              event.target.value
                            )
                          }
                          placeholder="Enter your email"
                        />

                      </div>

                      <div className="profile-form-field">

                        <label>
                          Profile Picture
                        </label>

                        <div className="profile-image-upload">

                          <label className="profile-upload-button">
                            📁 Choose Image

                            <input
                              type="file"
                              accept="image/*"
                              onChange={
                                handleImageUpload
                              }
                              hidden
                            />
                          </label>

                          <span className="profile-or-text">
                            OR
                          </span>

                          <input
                            type="text"
                            value={
                              profilePicture.startsWith(
                                "data:"
                              )
                                ? ""
                                : profilePicture
                            }
                            onChange={
                              handleImageUrlChange
                            }
                            placeholder="Paste image URL"
                          />

                        </div>

                        {imagePreview && (
                          <div className="profile-image-preview">

                            <img
                              src={imagePreview}
                              alt="Profile preview"
                            />

                            <button
                              type="button"
                              onClick={
                                removeProfilePicture
                              }
                            >
                              ✕ Remove
                            </button>

                          </div>
                        )}

                        <span className="profile-field-note">
                          You can choose an image
                          from your PC or paste an
                          image URL from the internet.
                        </span>

                      </div>

                      <div className="profile-form-field">

                        <label>
                          Account Type
                        </label>

                        <select
                          value={
                            accountType
                          }
                          onChange={(event) =>
                            setAccountType(
                              event.target.value
                            )
                          }
                        >
                          {accountTypes.map(
                            (type) => (
                              <option
                                key={type}
                                value={type}
                              >
                                {type}
                              </option>
                            )
                          )}
                        </select>

                      </div>

                    </div>
                  ) : (
                    <div className="profile-details">

                      <div className="profile-detail-item">

                        <span className="profile-detail-label">
                          Full Name
                        </span>

                        <strong>
                          {user.name}
                        </strong>

                      </div>

                      <div className="profile-detail-item">

                        <span className="profile-detail-label">
                          Email Address
                        </span>

                        <strong>
                          {user.email}
                        </strong>

                      </div>

                      <div className="profile-detail-item">

                        <span className="profile-detail-label">
                          Account Type
                        </span>

                        <strong>
                          {user.accountType ||
                            "Student"}
                        </strong>

                      </div>

                      <div className="profile-detail-item">

                        <span className="profile-detail-label">
                          Account Status
                        </span>

                        <strong className="profile-status-active">
                          {user.isActive
                            ? "Active"
                            : "Inactive"}
                        </strong>

                      </div>

                      <div className="profile-detail-item">

                        <span className="profile-detail-label">
                          Account Created
                        </span>

                        <strong>
                          {formatDate(
                            user.createdAt
                          )}
                        </strong>

                      </div>

                      <div className="profile-detail-item">

                        <span className="profile-detail-label">
                          Last Login
                        </span>

                        <strong>
                          {formatLastLogin(
                            user.lastLogin
                          )}
                        </strong>

                      </div>

                    </div>
                  )}

                  <div className="profile-divider"></div>

                  <div className="profile-actions">

                    {editMode ? (
                      <>
                        <button
                          type="button"
                          className="profile-cancel-button"
                          onClick={
                            handleCancelEdit
                          }
                          disabled={saving}
                        >
                          Cancel
                        </button>

                        <button
                          type="button"
                          className="profile-edit-button"
                          onClick={
                            handleSaveProfile
                          }
                          disabled={saving}
                        >
                          {saving
                            ? "Saving..."
                            : "💾 Save Changes"}
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          type="button"
                          className="profile-edit-button"
                          onClick={
                            handleEdit
                          }
                        >
                          ✏️ Edit Profile
                        </button>

                        <button
                          type="button"
                          className="profile-password-button"
                        >
                          🔒 Change Password
                        </button>
                      </>
                    )}

                  </div>

                  {!editMode && (
                    <>
                      <div className="profile-divider"></div>

                      <div className="profile-account-management">

                        <div className="profile-account-management-header">
                          <h3>
                            Account Management
                          </h3>

                          <p>
                            Manage the status of
                            your FocuseMate account.
                          </p>
                        </div>

                        <div className="profile-account-actions">

                          <button
                            type="button"
                            className="profile-deactivate-button"
                            onClick={
                              handleDeactivateAccount
                            }
                            disabled={
                              accountActionLoading
                            }
                          >
                            {accountActionLoading
                              ? "Processing..."
                              : "⏸️ Deactivate Account"}
                          </button>

                          <button
                            type="button"
                            className="profile-delete-button"
                            onClick={
                              handleDeleteAccount
                            }
                            disabled={
                              accountActionLoading
                            }
                          >
                            {accountActionLoading
                              ? "Processing..."
                              : "🗑️ Delete Account Permanently"}
                          </button>

                        </div>

                      </div>
                    </>
                  )}

                </div>
              ) : (
                <div className="profile-loading">
                  Unable to load profile.
                </div>
              )}

            </div>

          </div>

        </div>
      </main>
    </AuthGuard>
  );
}