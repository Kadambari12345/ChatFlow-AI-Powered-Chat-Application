import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import mongoose from "mongoose";
import Chat from "./models/Chat.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// =========================
// MONGODB CONNECTION
// =========================

mongoose
    .connect(process.env.MONGODB_URI)
    .then(() => {
        console.log("MongoDB connected successfully");
    })
    .catch((error) => {
        console.error("MongoDB connection error:", error.message);
    });

// =========================
// MIDDLEWARE
// =========================

app.use(cors());

app.use(
    express.json({
        limit: "10mb"
    })
);

// =========================
// HOME ROUTE
// =========================

app.get("/", (req, res) => {
    res.json({
        message: "ChatFlow backend is running",
        status: "success",
        database:
            mongoose.connection.readyState === 1
                ? "connected"
                : "disconnected"
    });
});

// =========================
// CHAT ROUTE
// =========================

app.post("/chat", async (req, res) => {
    try {
        // =========================
        // GET REQUEST DATA
        // =========================

        const {
            message,
            image,
            userId
        } = req.body;

        // =========================
        // CHECK USER ID
        // =========================

        if (!userId) {
            return res.status(400).json({
                error: "User ID is required."
            });
        }

        // =========================
        // CHECK MESSAGE / IMAGE
        // =========================

        if (!message && !image) {
            return res.status(400).json({
                error: "Message or image is required."
            });
        }

        // =========================
        // CHECK OPENROUTER API KEY
        // =========================

        if (!process.env.OPENROUTER_API_KEY) {
            return res.status(500).json({
                error: "OpenRouter API key is not configured."
            });
        }

        // =========================
        // PREPARE USER CONTENT
        // =========================

        let userContent;

        if (image) {
            // Image + optional text
            userContent = [
                {
                    type: "text",
                    text:
                        message ||
                        "Please analyze this image and explain what you see."
                },
                {
                    type: "image_url",
                    image_url: {
                        url: image
                    }
                }
            ];
        } else {
            // Text-only message
            userContent = message;
        }

        // =========================
        // OPENROUTER REQUEST
        // =========================

        const response = await fetch(
            "https://openrouter.ai/api/v1/chat/completions",
            {
                method: "POST",

                headers: {
                    Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
                    "Content-Type": "application/json",
                    "HTTP-Referer": "http://localhost:5173",
                    "X-Title": "ChatFlow"
                },

                body: JSON.stringify({
                    model: "openrouter/free",

                    messages: [
                        {
                            role: "system",
                            content:
                                "You are ChatFlow, a helpful AI assistant. Answer naturally and directly. When the user uploads an image, carefully analyze the image and answer the user's question about it. Do not add unnecessary safety labels or internal reasoning."
                        },
                        {
                            role: "user",
                            content: userContent
                        }
                    ]
                })
            }
        );

        // =========================
        // GET OPENROUTER RESPONSE
        // =========================

        const data = await response.json();

        console.log(
            "OpenRouter status:",
            response.status
        );

        // =========================
        // OPENROUTER ERROR HANDLING
        // =========================

        if (!response.ok) {
            console.error(
                "OpenRouter error:",
                data
            );

            // Free model usage limit
            if (response.status === 429) {
                return res.status(429).json({
                    error:
                        "ChatFlow has reached the current AI usage limit. Please try again later.",
                    limitReached: true
                });
            }

            // Invalid API key
            if (response.status === 401) {
                return res.status(401).json({
                    error:
                        "OpenRouter API key is invalid or unauthorized."
                });
            }

            // Credits required
            if (response.status === 402) {
                return res.status(402).json({
                    error:
                        "OpenRouter requires available credits for this request."
                });
            }

            return res.status(response.status).json({
                error:
                    data?.error?.message ||
                    "OpenRouter could not process the request."
            });
        }

        // =========================
        // GET AI RESPONSE
        // =========================

        const reply =
            data?.choices?.[0]?.message?.content;

        if (!reply) {
            console.error(
                "Unexpected OpenRouter response:",
                data
            );

            return res.status(500).json({
                error:
                    "The AI returned an empty response."
            });
        }

        // =========================
        // SAVE CHAT TO MONGODB
        // =========================

        const chatTitle =
            message && message.trim()
                ? message.trim().slice(0, 50)
                : image
                    ? "Image Analysis"
                    : "New Chat";

        const newChat = new Chat({
            userId: userId,

            title: chatTitle,

            messages: [
                {
                    role: "user",
                    content: message || "",
                    image: image || null
                },
                {
                    role: "assistant",
                    content: reply,
                    image: null
                }
            ]
        });

        await newChat.save();

        console.log(
            "Chat saved to MongoDB:",
            newChat._id.toString()
        );

        // =========================
        // SEND RESPONSE TO FRONTEND
        // =========================

        res.json({
            reply,
            chatId: newChat._id
        });

    } catch (error) {
        console.error(
            "ChatFlow server error:",
            error
        );

        res.status(500).json({
            error:
                "Unable to connect to the AI service. Please try again."
        });
    }
});

// =========================
// START SERVER
// =========================

app.listen(PORT, () => {
    console.log(
        `ChatFlow backend running on http://localhost:${PORT}`
    );
});