import { useEffect, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

import {
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  onAuthStateChanged,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  updateProfile,
} from "firebase/auth";

import { auth } from "./firebase";
import "./App.css";

const API_URL = "http://localhost:5000";

function App() {
  // =========================
  // AUTH STATE
  // =========================
  const [loggedIn, setLoggedIn] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);

  const [showCreateAccount, setShowCreateAccount] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);

  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");

  const [signupName, setSignupName] = useState("");
  const [signupEmail, setSignupEmail] = useState("");
  const [signupPassword, setSignupPassword] = useState("");

  const [resetEmail, setResetEmail] = useState("");

  const [authMessage, setAuthMessage] = useState("");
  const [resetMessage, setResetMessage] = useState("");
  const [authLoading, setAuthLoading] = useState(false);

  // =========================
  // CHAT STATE
  // =========================
  const [message, setMessage] = useState("");
  const [interimText, setInterimText] = useState("");
  const [messages, setMessages] = useState([]);
  const [history, setHistory] = useState([]);
  const [isGenerating, setIsGenerating] = useState(false);

  // =========================
  // IMAGE STATE
  // =========================
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  const imageInputRef = useRef(null);

  // =========================
  // VOICE STATE
  // =========================
  const [isListening, setIsListening] = useState(false);
  const [voiceSupported, setVoiceSupported] = useState(true);

  const recognitionRef = useRef(null);

  // =========================
  // PROFILE STATE
  // =========================
  const [showProfile, setShowProfile] = useState(false);
  const [showEditProfile, setShowEditProfile] = useState(false);

  const [displayName, setDisplayName] = useState("");
  const [editName, setEditName] = useState("");
  const [profilePicture, setProfilePicture] = useState("");

  // =========================
  // SETTINGS
  // =========================
  const [showSettings, setShowSettings] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [notifications, setNotifications] = useState(true);
  const [enterToSend, setEnterToSend] = useState(true);

  // =========================
  // FIREBASE AUTH LISTENER
  // =========================
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      console.log("Firebase user:", user);

      setCurrentUser(user);

      if (user) {
        setLoggedIn(true);
        setDisplayName(user.displayName || "");
        setEditName(user.displayName || "");
      } else {
        setLoggedIn(false);
        setDisplayName("");
        setEditName("");
        setMessages([]);
        setHistory([]);
        setSelectedImage(null);
        setImagePreview(null);
        setShowProfile(false);
        setShowEditProfile(false);
        setShowSettings(false);
      }

      setCheckingAuth(false);
    });

    return () => unsubscribe();
  }, []);

  // =========================
  // VOICE SUPPORT
  // =========================
  useEffect(() => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setVoiceSupported(false);
      return;
    }

    const recognition = new SpeechRecognition();

    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = "en-IN";

    recognition.onstart = () => {
      setIsListening(true);
    };

    recognition.onresult = (event) => {
      let finalTranscript = "";
      let temporaryTranscript = "";

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;

        if (event.results[i].isFinal) {
          finalTranscript += transcript + " ";
        } else {
          temporaryTranscript += transcript;
        }
      }

      if (finalTranscript) {
        setMessage((previous) => {
          const separator = previous.trim() ? " " : "";
          return previous + separator + finalTranscript.trim();
        });
      }

      setInterimText(temporaryTranscript);
    };

    recognition.onerror = (event) => {
      console.log("Voice recognition error:", event.error);
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
      setInterimText("");
    };

    recognitionRef.current = recognition;

    return () => {
      try {
        recognition.stop();
      } catch {
        // Recognition may already be stopped.
      }
    };
  }, []);

  // =========================
  // FIREBASE ERROR HANDLER
  // =========================
  const getFriendlyAuthError = (error) => {
    switch (error?.code) {
      case "auth/invalid-credential":
        return "Incorrect email or password.";

      case "auth/invalid-email":
        return "Please enter a valid email address.";

      case "auth/user-not-found":
        return "No account was found with this email.";

      case "auth/wrong-password":
        return "Incorrect password.";

      case "auth/email-already-in-use":
        return "An account already exists with this email.";

      case "auth/weak-password":
        return "Password should contain at least 6 characters.";

      case "auth/popup-closed-by-user":
        return "Google sign-in was cancelled.";

      case "auth/network-request-failed":
        return "Network error. Please check your internet connection.";

      case "auth/too-many-requests":
        return "Too many attempts. Please try again later.";

      default:
        return error?.message || "Something went wrong. Please try again.";
    }
  };

  // =========================
  // LOGIN
  // =========================
  const handleLogin = async (event) => {
    event.preventDefault();

    if (!loginEmail.trim() || !loginPassword.trim()) {
      setAuthMessage("Please enter your email and password.");
      return;
    }

    try {
      setAuthLoading(true);
      setAuthMessage("");

      await signInWithEmailAndPassword(
        auth,
        loginEmail.trim(),
        loginPassword
      );

      setLoginEmail("");
      setLoginPassword("");
    } catch (error) {
      setAuthMessage(getFriendlyAuthError(error));
    } finally {
      setAuthLoading(false);
    }
  };

  // =========================
  // GOOGLE LOGIN
  // =========================
  const handleGoogleLogin = async () => {
    try {
      setAuthLoading(true);
      setAuthMessage("");

      const provider = new GoogleAuthProvider();

      await signInWithPopup(auth, provider);
    } catch (error) {
      setAuthMessage(getFriendlyAuthError(error));
    } finally {
      setAuthLoading(false);
    }
  };

  // =========================
  // CREATE ACCOUNT
  // =========================
  const handleCreateAccount = async (event) => {
    event.preventDefault();

    if (!signupName.trim()) {
      setAuthMessage("Please enter your name.");
      return;
    }

    if (!signupEmail.trim()) {
      setAuthMessage("Please enter your email.");
      return;
    }

    if (signupPassword.length < 6) {
      setAuthMessage("Password should contain at least 6 characters.");
      return;
    }

    try {
      setAuthLoading(true);
      setAuthMessage("");

      const userCredential = await createUserWithEmailAndPassword(
        auth,
        signupEmail.trim(),
        signupPassword
      );

      await updateProfile(userCredential.user, {
        displayName: signupName.trim(),
      });

      setDisplayName(signupName.trim());
      setEditName(signupName.trim());

      setSignupName("");
      setSignupEmail("");
      setSignupPassword("");

      setShowCreateAccount(false);
    } catch (error) {
      setAuthMessage(getFriendlyAuthError(error));
    } finally {
      setAuthLoading(false);
    }
  };

  // =========================
  // FORGOT PASSWORD
  // =========================
  const handleForgotPassword = async (event) => {
    event.preventDefault();

    if (!resetEmail.trim()) {
      setResetMessage("Please enter your email address.");
      return;
    }

    try {
      setAuthLoading(true);
      setResetMessage("");

      await sendPasswordResetEmail(auth, resetEmail.trim());

      setResetMessage(
        "Password reset email sent. Please check your inbox or spam folder."
      );
    } catch (error) {
      setResetMessage(getFriendlyAuthError(error));
    } finally {
      setAuthLoading(false);
    }
  };

  // =========================
  // LOGOUT
  // =========================
  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  // =========================
  // VOICE INPUT
  // =========================
  const toggleVoiceInput = () => {
    if (!voiceSupported || !recognitionRef.current) {
      alert(
        "Voice input is not supported in this browser. Please use Chrome or Edge."
      );
      return;
    }

    if (isListening) {
      try {
        recognitionRef.current.stop();
      } catch {
        // Already stopped.
      }

      setIsListening(false);
      return;
    }

    try {
      recognitionRef.current.start();
    } catch (error) {
      console.log("Voice start error:", error);
    }
  };

  // =========================
  // IMAGE SELECT
  // =========================
  const handleImageSelect = (event) => {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    if (!file.type.startsWith("image/")) {
      alert("Please select an image file.");
      event.target.value = "";
      return;
    }

    // Maximum 5 MB
    if (file.size > 5 * 1024 * 1024) {
      alert("Please select an image smaller than 5 MB.");
      event.target.value = "";
      return;
    }

    setSelectedImage(file);

    const reader = new FileReader();

    reader.onloadend = () => {
      setImagePreview(reader.result);
    };

    reader.readAsDataURL(file);
  };

  // =========================
  // REMOVE SELECTED IMAGE
  // =========================
  const removeSelectedImage = () => {
    setSelectedImage(null);
    setImagePreview(null);

    if (imageInputRef.current) {
      imageInputRef.current.value = "";
    }
  };

  // =========================
  // OPEN IMAGE PICKER
  // =========================
  const openImagePicker = () => {
    if (isGenerating) {
      return;
    }

    imageInputRef.current?.click();
  };

  // =========================
  // SHOW AI RESPONSE
  // =========================
  const showResponse = async (reply) => {
    const safeReply =
      reply ||
      "I couldn't generate a response right now. Please try again.";

    const aiMessageId = Date.now();

    setMessages((previous) => [
      ...previous,
      {
        id: aiMessageId,
        role: "assistant",
        content: safeReply,
      },
    ]);

    /*
      Do not split the response.

      Markdown code blocks must remain intact:

      ```javascript
      const hello = "Hello";
      console.log(hello);
      ```

      ReactMarkdown will render them correctly.
    */

    setIsGenerating(false);
  };

  // =========================
  // FORMAT RESET TIME
  // =========================
  const formatResetTime = (resetTime) => {
    if (!resetTime) {
      return "the next available reset";
    }

    const date = new Date(resetTime);

    if (Number.isNaN(date.getTime())) {
      return "the next available reset";
    }

    return date.toLocaleString([], {
      dateStyle: "medium",
      timeStyle: "short",
    });
  };

  // =========================
  // SEND MESSAGE
  // =========================
  const sendMessage = async () => {
    const trimmedMessage = message.trim();
if (!currentUser) {
    console.error("No Firebase user found.");
    return;
}
    /*
      Allow:
      1. Text only
      2. Image only
      3. Text + image
    */
    if ((!trimmedMessage && !imagePreview) || isGenerating) {
      return;
    }

    if (isListening && recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {
        // Already stopped.
      }

      setIsListening(false);
    }

    setInterimText("");
    setMessage("");
    setIsGenerating(true);

    const userMessageId = Date.now();

    const userMessage = {
      id: userMessageId,
      role: "user",
      content: trimmedMessage,
      image: imagePreview || null,
    };

    setMessages((previous) => [...previous, userMessage]);

    const historyItem = {
      id: userMessageId,
      message:
        trimmedMessage ||
        (selectedImage ? "Image analysis" : "New conversation"),
      time: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
    };

    setHistory((previous) => [historyItem, ...previous]);

    /*
      Save the image locally before clearing the composer.
    */
    const imageToSend = imagePreview;

    // Clear image selection
    setSelectedImage(null);
    setImagePreview(null);

    if (imageInputRef.current) {
      imageInputRef.current.value = "";
    }

    try {
      const response = await fetch(`${API_URL}/chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
    message: trimmedMessage,
    image: imageToSend || null,
    userId: currentUser?.uid
}),
      });

      const data = await response.json();

      // =========================
      // DAILY LIMIT
      // =========================
      if (response.status === 429) {
        const resetText = formatResetTime(data?.resetTime);

        setMessages((previous) => [
          ...previous,
          {
            id: Date.now() + 1,
            role: "assistant",
            isError: true,
            isLimitMessage: true,
            content: `You've reached today's free AI message limit.

Your free ChatFlow AI access will be available again at **${resetText}**.

Please come back after the limit resets.`,
          },
        ]);

        setIsGenerating(false);
        return;
      }

      // =========================
      // OTHER API ERRORS
      // =========================
      if (!response.ok) {
        throw new Error(
          data?.error || "Failed to get AI response."
        );
      }

      await showResponse(data.reply);
    } catch (error) {
      console.error("Chat error:", error);

      setMessages((previous) => [
        ...previous,
        {
          id: Date.now() + 1,
          role: "assistant",
          content:
            error.message ||
            "Sorry, I couldn't get a response right now. Please try again later.",
          isError: true,
        },
      ]);

      setIsGenerating(false);
    }
  };

  // =========================
  // ENTER KEY
  // =========================
  const handleKeyDown = (event) => {
    if (event.key === "Enter" && !event.shiftKey && enterToSend) {
      event.preventDefault();
      sendMessage();
    }
  };

  // =========================
  // NEW CHAT
  // =========================
  const newChat = () => {
    setMessages([]);
    setMessage("");
    setInterimText("");
    removeSelectedImage();
    setShowProfile(false);
    setShowSettings(false);
  };

  // =========================
  // DELETE HISTORY ITEM
  // =========================
  const deleteHistoryItem = (id, event) => {
    event.stopPropagation();

    setHistory((previous) =>
      previous.filter((item) => item.id !== id)
    );
  };

  // =========================
  // OPEN HISTORY CHAT
  // =========================
  const openHistoryChat = (item) => {
    setMessage(item.message);
    setShowProfile(false);
  };

  // =========================
  // CLEAR HISTORY
  // =========================
  const clearHistory = () => {
    setHistory([]);
  };

  // =========================
  // SUGGESTION
  // =========================
  const useSuggestion = (text) => {
    setMessage(text);

    setTimeout(() => {
      const input = document.querySelector(".message-input");

      if (input) {
        input.focus();
      }
    }, 50);
  };

  // =========================
  // PROFILE PICTURE
  // =========================
  const handleProfilePicture = (event) => {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    if (!file.type.startsWith("image/")) {
      return;
    }

    const reader = new FileReader();

    reader.onload = () => {
      setProfilePicture(reader.result);
    };

    reader.readAsDataURL(file);
  };

  // =========================
  // SAVE PROFILE
  // =========================
  const saveProfile = async () => {
    const cleanName = editName.trim();

    if (!cleanName) {
      return;
    }

    try {
      if (auth.currentUser) {
        await updateProfile(auth.currentUser, {
          displayName: cleanName,
        });

        setCurrentUser({
          ...auth.currentUser,
          displayName: cleanName,
        });
      }

      setDisplayName(cleanName);
      setShowEditProfile(false);
    } catch (error) {
      console.error("Profile update error:", error);
    }
  };

  // =========================
  // AVATAR
  // =========================
  const avatarLetter =
    displayName?.trim()?.charAt(0)?.toUpperCase() || "C";

  // =========================
  // MARKDOWN RENDERER
  // =========================
  const renderMarkdown = (content) => {
    return (
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          code({ inline, className, children, ...props }) {
            if (inline) {
              return (
                <code
                  className={`inline-code ${className || ""}`}
                  {...props}
                >
                  {children}
                </code>
              );
            }

            return (
              <div className="code-block-wrapper">
                <pre className="code-block">
                  <code className={className || ""} {...props}>
                    {children}
                  </code>
                </pre>
              </div>
            );
          },

          pre({ children }) {
            return <>{children}</>;
          },

          p({ children }) {
            return <p>{children}</p>;
          },

          ul({ children }) {
            return <ul>{children}</ul>;
          },

          ol({ children }) {
            return <ol>{children}</ol>;
          },

          li({ children }) {
            return <li>{children}</li>;
          },

          h1({ children }) {
            return <h1>{children}</h1>;
          },

          h2({ children }) {
            return <h2>{children}</h2>;
          },

          h3({ children }) {
            return <h3>{children}</h3>;
          },

          blockquote({ children }) {
            return <blockquote>{children}</blockquote>;
          },

          a({ href, children }) {
            return (
              <a
                href={href}
                target="_blank"
                rel="noopener noreferrer"
              >
                {children}
              </a>
            );
          },
        }}
      >
        {content}
      </ReactMarkdown>
    );
  };

  // =========================
  // LOADING SCREEN
  // =========================
  if (checkingAuth) {
    return (
      <div className="loading-screen">
        <div className="loading-logo">
          <span>✦</span>
        </div>

        <h2>ChatFlow</h2>

        <div className="loading-spinner"></div>

        <p>Preparing your workspace...</p>
      </div>
    );
  }

  // =========================
  // AUTH SCREEN
  // =========================
  if (!loggedIn) {
    return (
      <div className="auth-page">
        <div className="auth-background-shape shape-one"></div>
        <div className="auth-background-shape shape-two"></div>

        <div className="auth-card">
          <div className="auth-brand">
            <div className="brand-icon large">
              <span>✦</span>
            </div>

            <div>
              <h1>ChatFlow</h1>
              <p>Your intelligent AI workspace</p>
            </div>
          </div>

          <div className="auth-heading">
            <h2>Welcome back</h2>
            <p>Sign in to continue your conversation.</p>
          </div>

          {authMessage && (
            <div className="auth-message error-message">
              {authMessage}
            </div>
          )}

          <form onSubmit={handleLogin} className="auth-form">
            <div className="form-group">
              <label>Email address</label>

              <div className="input-with-icon">
                <span>✉</span>

                <input
                  type="email"
                  placeholder="Enter your email"
                  value={loginEmail}
                  onChange={(event) =>
                    setLoginEmail(event.target.value)
                  }
                  autoComplete="email"
                />
              </div>
            </div>

            <div className="form-group">
              <label>Password</label>

              <div className="input-with-icon">
                <span>●</span>

                <input
                  type="password"
                  placeholder="Enter your password"
                  value={loginPassword}
                  onChange={(event) =>
                    setLoginPassword(event.target.value)
                  }
                  autoComplete="current-password"
                />
              </div>
            </div>

            <button
              type="submit"
              className="primary-auth-button"
              disabled={authLoading}
            >
              {authLoading ? "Signing in..." : "Sign in"}
            </button>
          </form>

          <button
            type="button"
            className="forgot-link"
            onClick={() => {
              setShowForgotPassword(true);
              setAuthMessage("");
              setResetMessage("");
            }}
          >
            Forgot your password?
          </button>

          <div className="auth-divider">
            <span>or continue with</span>
          </div>

          <button
            type="button"
            className="google-button"
            onClick={handleGoogleLogin}
            disabled={authLoading}
          >
            <span className="google-icon">G</span>
            Continue with Google
          </button>

          <div className="signup-text">
            <span>Don't have an account?</span>

            <button
              type="button"
              onClick={() => {
                setShowCreateAccount(true);
                setAuthMessage("");
              }}
            >
              Create account
            </button>
          </div>

          <p className="auth-footer">
            By continuing, you agree to use ChatFlow responsibly.
          </p>
        </div>

        {/* CREATE ACCOUNT MODAL */}
        {showCreateAccount && (
          <div
            className="modal-overlay"
            onClick={() => setShowCreateAccount(false)}
          >
            <div
              className="modal-card auth-modal"
              onClick={(event) => event.stopPropagation()}
            >
              <button
                type="button"
                className="modal-close"
                onClick={() => setShowCreateAccount(false)}
              >
                ×
              </button>

              <div className="modal-icon">✦</div>

              <h2>Create your account</h2>

              <p className="modal-description">
                Start using your personal AI workspace.
              </p>

              {authMessage && (
                <div className="auth-message error-message">
                  {authMessage}
                </div>
              )}

              <form
                onSubmit={handleCreateAccount}
                className="auth-form"
              >
                <div className="form-group">
                  <label>Your name</label>

                  <input
                    type="text"
                    placeholder="Enter your name"
                    value={signupName}
                    onChange={(event) =>
                      setSignupName(event.target.value)
                    }
                  />
                </div>

                <div className="form-group">
                  <label>Email address</label>

                  <input
                    type="email"
                    placeholder="Enter your email"
                    value={signupEmail}
                    onChange={(event) =>
                      setSignupEmail(event.target.value)
                    }
                  />
                </div>

                <div className="form-group">
                  <label>Password</label>

                  <input
                    type="password"
                    placeholder="Create a password"
                    value={signupPassword}
                    onChange={(event) =>
                      setSignupPassword(event.target.value)
                    }
                  />
                </div>

                <button
                  type="submit"
                  className="primary-auth-button"
                  disabled={authLoading}
                >
                  {authLoading
                    ? "Creating account..."
                    : "Create account"}
                </button>
              </form>
            </div>
          </div>
        )}

        {/* FORGOT PASSWORD MODAL */}
        {showForgotPassword && (
          <div
            className="modal-overlay"
            onClick={() => setShowForgotPassword(false)}
          >
            <div
              className="modal-card auth-modal"
              onClick={(event) => event.stopPropagation()}
            >
              <button
                type="button"
                className="modal-close"
                onClick={() => setShowForgotPassword(false)}
              >
                ×
              </button>

              <div className="modal-icon">↻</div>

              <h2>Reset your password</h2>

              <p className="modal-description">
                Enter your email and we'll send you a password
                reset link.
              </p>

              {resetMessage && (
                <div
                  className={`auth-message ${
                    resetMessage.includes("sent")
                      ? "success-message"
                      : "error-message"
                  }`}
                >
                  {resetMessage}
                </div>
              )}

              <form
                onSubmit={handleForgotPassword}
                className="auth-form"
              >
                <div className="form-group">
                  <label>Email address</label>

                  <input
                    type="email"
                    placeholder="Enter your email"
                    value={resetEmail}
                    onChange={(event) =>
                      setResetEmail(event.target.value)
                    }
                  />
                </div>

                <button
                  type="submit"
                  className="primary-auth-button"
                  disabled={authLoading}
                >
                  {authLoading
                    ? "Sending..."
                    : "Send reset link"}
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    );
  }

  // =========================
  // MAIN APPLICATION
  // =========================
  return (
    <div
      className={`chatflow-app ${
        darkMode ? "dark-mode" : ""
      }`}
    >
      {/* SIDEBAR */}
      <aside className="sidebar">
        <div className="sidebar-top">
          <div className="sidebar-brand">
            <div className="brand-icon">
              <span>✦</span>
            </div>

            <div>
              <h1>ChatFlow</h1>
              <span>AI workspace</span>
            </div>
          </div>

          <button
            type="button"
            className="new-chat-button"
            onClick={newChat}
          >
            <span>＋</span>
            New Chat
          </button>

          <div className="history-section">
            <div className="section-title">
              <span>Recent Chats</span>

              {history.length > 0 && (
                <button
                  type="button"
                  className="clear-history"
                  onClick={clearHistory}
                  title="Clear history"
                >
                  Clear
                </button>
              )}
            </div>

            <div className="history-list">
              {history.length === 0 ? (
                <div className="empty-history">
                  <div className="empty-history-icon">◌</div>

                  <p>Your recent chats will appear here.</p>
                </div>
              ) : (
                history.map((item) => (
                  <div
                    className="history-item"
                    key={item.id}
                    onClick={() => openHistoryChat(item)}
                  >
                    <div className="history-icon">◌</div>

                    <div className="history-content">
                      <span>{item.message}</span>
                      <small>{item.time}</small>
                    </div>

                    <button
                      type="button"
                      className="history-delete"
                      onClick={(event) =>
                        deleteHistoryItem(item.id, event)
                      }
                      title="Delete chat"
                    >
                      ×
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        <div className="sidebar-bottom">
          <div className="upgrade-card">
            <div className="upgrade-icon">✦</div>

            <div className="upgrade-content">
              <strong>Upgrade Plan</strong>
              <p>Unlock more AI features</p>
            </div>

            <span className="upgrade-arrow">›</span>
          </div>

          <div className="sidebar-profile">
            <button
              type="button"
              className="profile-button"
              onClick={() =>
                setShowProfile(!showProfile)
              }
            >
              {profilePicture ? (
                <img
                  src={profilePicture}
                  alt="Profile"
                  className="avatar-image"
                />
              ) : (
                <div className="avatar">
                  {avatarLetter}
                </div>
              )}

              <div className="profile-info">
                <strong>
                  {displayName || "ChatFlow User"}
                </strong>

                <span>
                  {currentUser?.email || "No email"}
                </span>
              </div>

              <span className="profile-dots">⋮</span>
            </button>

            {showProfile && (
              <div className="profile-menu">
                <button
                  type="button"
                  onClick={() => {
                    setEditName(displayName);
                    setShowEditProfile(true);
                    setShowProfile(false);
                  }}
                >
                  <span>♙</span>
                  Edit Profile
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setShowSettings(true);
                    setShowProfile(false);
                  }}
                >
                  <span>⚙</span>
                  Settings
                </button>

                <div className="profile-menu-divider"></div>

                <button
                  type="button"
                  className="logout-menu-item"
                  onClick={handleLogout}
                >
                  <span>↪</span>
                  Log out
                </button>
              </div>
            )}
          </div>
        </div>
      </aside>

      {/* MAIN AREA */}
      <main className="main-area">
        {/* HEADER */}
        <header className="chat-header">
          <div className="header-left">
            <div className="mobile-brand">
              <div className="brand-icon">
                <span>✦</span>
              </div>

              <strong>ChatFlow</strong>
            </div>

            <div className="ai-title">
              <div className="ai-avatar">✦</div>

              <div>
                <h2>ChatFlow AI</h2>

                <div className="online-status">
                  <span className="online-dot"></span>
                  AI assistant online
                </div>
              </div>
            </div>
          </div>

          <div className="header-actions">
            <button
              type="button"
              className="header-profile"
              onClick={() =>
                setShowProfile(!showProfile)
              }
              title="Profile"
            >
              {profilePicture ? (
                <img
                  src={profilePicture}
                  alt="Profile"
                  className="avatar-image"
                />
              ) : (
                <span>{avatarLetter}</span>
              )}
            </button>
          </div>
        </header>

        {/* CHAT CONTENT */}
        <div className="chat-content">
          {messages.length === 0 ? (
            <div className="welcome-area">
              <div className="welcome-icon">
                <span>✦</span>
              </div>

              <h1>How can I help you today?</h1>

              <p>
                Ask anything, brainstorm ideas, learn something
                new, or get help with your work.
              </p>

              <div className="suggestion-grid">
                <button
                  type="button"
                  className="suggestion-card"
                  onClick={() =>
                    useSuggestion(
                      "Explain React.js in simple words."
                    )
                  }
                >
                  <div className="suggestion-icon pink">
                    ⚛
                  </div>

                  <div>
                    <strong>Learn something</strong>
                    <span>
                      Explain React.js in simple words
                    </span>
                  </div>

                  <span className="suggestion-arrow">→</span>
                </button>

                <button
                  type="button"
                  className="suggestion-card"
                  onClick={() =>
                    useSuggestion(
                      "Help me create a professional software engineering resume."
                    )
                  }
                >
                  <div className="suggestion-icon purple">
                    ✎
                  </div>

                  <div>
                    <strong>Improve my work</strong>
                    <span>
                      Help me create a professional resume
                    </span>
                  </div>

                  <span className="suggestion-arrow">→</span>
                </button>

                <button
                  type="button"
                  className="suggestion-card"
                  onClick={() =>
                    useSuggestion(
                      "Give me some unique software project ideas."
                    )
                  }
                >
                  <div className="suggestion-icon yellow">
                    ✦
                  </div>

                  <div>
                    <strong>Get creative</strong>
                    <span>
                      Give me some project ideas
                    </span>
                  </div>

                  <span className="suggestion-arrow">→</span>
                </button>

                <button
                  type="button"
                  className="suggestion-card"
                  onClick={() =>
                    useSuggestion(
                      "Practice software engineering interview questions with me."
                    )
                  }
                >
                  <div className="suggestion-icon blue">
                    ◈
                  </div>

                  <div>
                    <strong>Prepare for interview</strong>
                    <span>
                      Practice software interview questions
                    </span>
                  </div>

                  <span className="suggestion-arrow">→</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="messages-container">
              {messages.map((item) => (
                <div
                  className={`message-row ${
                    item.role === "user"
                      ? "user-row"
                      : "assistant-row"
                  }`}
                  key={item.id}
                >
                  {item.role === "assistant" && (
                    <div className="message-avatar ai-message-avatar">
                      ✦
                    </div>
                  )}

                  <div
                    className={`message-bubble ${
                      item.role === "user"
                        ? "user-message"
                        : "assistant-message"
                    } ${
                      item.isError
                        ? "message-error"
                        : ""
                    } ${
                      item.isLimitMessage
                        ? "limit-message"
                        : ""
                    }`}
                  >
                    {/* USER IMAGE */}
                    {item.role === "user" && item.image && (
                      <img
                        src={item.image}
                        alt="Uploaded"
                        className="chat-image"
                      />
                    )}

                    {/* MESSAGE CONTENT */}
                    {item.role === "assistant" ? (
                      renderMarkdown(item.content)
                    ) : (
                      item.content && (
                        <div className="user-message-text">
                          {item.content}
                        </div>
                      )
                    )}
                  </div>

                  {item.role === "user" && (
                    <div className="message-avatar user-message-avatar">
                      {avatarLetter}
                    </div>
                  )}
                </div>
              ))}

              {isGenerating && (
                <div className="message-row assistant-row">
                  <div className="message-avatar ai-message-avatar">
                    ✦
                  </div>

                  <div className="thinking-bubble">
                    <span className="thinking-label">
                      Thinking
                    </span>

                    <div className="thinking-dots">
                      <span></span>
                      <span></span>
                      <span></span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* COMPOSER */}
        <div className="composer-area">
          <div className="composer-box">

            {/* IMAGE PREVIEW */}
            {imagePreview && (
              <div className="selected-image-preview">
                <div className="image-preview-card">
                  <img
                    src={imagePreview}
                    alt="Selected"
                  />

                  <button
                    type="button"
                    className="remove-image-button"
                    onClick={removeSelectedImage}
                    title="Remove image"
                  >
                    ×
                  </button>
                </div>

                <div className="image-preview-info">
                  <strong>
                    {selectedImage?.name || "Selected image"}
                  </strong>

                  <span>
                    Image ready to send
                  </span>
                </div>
              </div>
            )}

            <textarea
              className="message-input"
              placeholder={
                imagePreview
                  ? "Ask something about this image..."
                  : "Message ChatFlow AI..."
              }
              value={message}
              onChange={(event) =>
                setMessage(event.target.value)
              }
              onKeyDown={handleKeyDown}
              rows={1}
              disabled={isGenerating}
            />

            {interimText && (
              <div className="voice-preview">
                <span>Listening:</span> {interimText}
              </div>
            )}

            <div className="composer-actions">
              <div className="composer-left">

                {/* IMAGE BUTTON */}
                <button
                  type="button"
                  className="attach-button"
                  onClick={openImagePicker}
                  disabled={isGenerating}
                  title="Upload image"
                >
                  📎
                </button>

                <input
                  ref={imageInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageSelect}
                  style={{ display: "none" }}
                />

                {/* VOICE BUTTON */}
                <button
                  type="button"
                  className={`voice-button ${
                    isListening ? "listening" : ""
                  }`}
                  onClick={toggleVoiceInput}
                  title={
                    voiceSupported
                      ? "Voice input"
                      : "Voice input not supported"
                  }
                  disabled={!voiceSupported || isGenerating}
                >
                  {isListening ? "●" : "♩"}
                </button>

                <span className="composer-hint">
                  {isListening
                    ? "Listening..."
                    : imagePreview
                    ? "Image ready"
                    : "Press Enter to send"}
                </span>
              </div>

              <button
                type="button"
                className={`send-button ${
                  (message.trim() || imagePreview) &&
                  !isGenerating
                    ? "active"
                    : ""
                }`}
                onClick={sendMessage}
                disabled={
                  (!message.trim() && !imagePreview) ||
                  isGenerating
                }
                title="Send message"
              >
                ↑
              </button>
            </div>
          </div>

          <p className="composer-disclaimer">
            ChatFlow AI can make mistakes. Check important
            information before relying on it.
          </p>
        </div>
      </main>

      {/* EDIT PROFILE MODAL */}
      {showEditProfile && (
        <div
          className="modal-overlay"
          onClick={() => setShowEditProfile(false)}
        >
          <div
            className="modal-card profile-modal"
            onClick={(event) =>
              event.stopPropagation()
            }
          >
            <button
              type="button"
              className="modal-close"
              onClick={() =>
                setShowEditProfile(false)
              }
            >
              ×
            </button>

            <div className="modal-header">
              <div className="modal-icon">♙</div>

              <div>
                <h2>Edit Profile</h2>
                <p>Update your ChatFlow profile.</p>
              </div>
            </div>

            <div className="profile-picture-section">
              <div className="large-avatar">
                {profilePicture ? (
                  <img
                    src={profilePicture}
                    alt="Profile"
                  />
                ) : (
                  avatarLetter
                )}
              </div>

              <label className="upload-picture-button">
                Change photo

                <input
                  type="file"
                  accept="image/*"
                  onChange={handleProfilePicture}
                />
              </label>
            </div>

            <div className="form-group">
              <label>Display name</label>

              <input
                type="text"
                value={editName}
                onChange={(event) =>
                  setEditName(event.target.value)
                }
                placeholder="Enter your name"
              />
            </div>

            <div className="profile-email-box">
              <span>Email</span>

              <strong>
                {currentUser?.email || "No email"}
              </strong>
            </div>

            <div className="modal-actions">
              <button
                type="button"
                className="secondary-button"
                onClick={() =>
                  setShowEditProfile(false)
                }
              >
                Cancel
              </button>

              <button
                type="button"
                className="primary-button"
                onClick={saveProfile}
              >
                Save changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* SETTINGS MODAL */}
      {showSettings && (
        <div
          className="modal-overlay"
          onClick={() => setShowSettings(false)}
        >
          <div
            className="modal-card settings-modal"
            onClick={(event) =>
              event.stopPropagation()
            }
          >
            <button
              type="button"
              className="modal-close"
              onClick={() => setShowSettings(false)}
            >
              ×
            </button>

            <div className="modal-header">
              <div className="modal-icon">⚙</div>

              <div>
                <h2>Settings</h2>
                <p>
                  Customize your ChatFlow experience.
                </p>
              </div>
            </div>

            <div className="settings-list">
              <div className="setting-item">
                <div className="setting-info">
                  <strong>Dark mode</strong>

                  <span>
                    Use a darker appearance for the
                    workspace.
                  </span>
                </div>

                <button
                  type="button"
                  className={`toggle ${
                    darkMode ? "toggle-on" : ""
                  }`}
                  onClick={() =>
                    setDarkMode(!darkMode)
                  }
                  aria-label="Toggle dark mode"
                >
                  <span></span>
                </button>
              </div>

              <div className="setting-item">
                <div className="setting-info">
                  <strong>Notifications</strong>

                  <span>
                    Keep useful ChatFlow notifications
                    enabled.
                  </span>
                </div>

                <button
                  type="button"
                  className={`toggle ${
                    notifications ? "toggle-on" : ""
                  }`}
                  onClick={() =>
                    setNotifications(!notifications)
                  }
                  aria-label="Toggle notifications"
                >
                  <span></span>
                </button>
              </div>

              <div className="setting-item">
                <div className="setting-info">
                  <strong>Enter to send</strong>

                  <span>
                    Press Enter to send a message. Use
                    Shift + Enter for a new line.
                  </span>
                </div>

                <button
                  type="button"
                  className={`toggle ${
                    enterToSend ? "toggle-on" : ""
                  }`}
                  onClick={() =>
                    setEnterToSend(!enterToSend)
                  }
                  aria-label="Toggle enter to send"
                >
                  <span></span>
                </button>
              </div>
            </div>

            <div className="settings-note">
              <span>✦</span>

              <p>
                More personalization options can be
                added as ChatFlow grows.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;