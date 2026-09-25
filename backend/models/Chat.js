import mongoose from "mongoose";

const messageSchema = new mongoose.Schema(
    {
        role: {
            type: String,
            enum: ["user", "assistant"],
            required: true
        },

        content: {
            type: String,
            default: ""
        },

        image: {
            type: String,
            default: null
        }
    },
    {
        _id: false
    }
);

const chatSchema = new mongoose.Schema(
    {
        userId: {
            type: String,
            required: true,
            index: true
        },

        title: {
            type: String,
            default: "New Chat"
        },

        messages: {
            type: [messageSchema],
            default: []
        }
    },
    {
        timestamps: true
    }
);

const Chat = mongoose.model("Chat", chatSchema);

export default Chat;