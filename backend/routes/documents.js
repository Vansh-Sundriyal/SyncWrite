const express = require("express");

const Document = require("../models/Document");
const User = require("../models/User");
const protect = require("../middleware/auth");

const router = express.Router();

// Protect all document routes.
router.use(protect);

router.get("/", async (req, res) => {
  try {
    const documents = await Document.find({
      $or: [
        { owner: req.userId },
        { collaborators: req.userId },
      ],
    })
      .populate("owner", "name email")
      .sort({ updatedAt: -1 });

    res.json(documents);
  } catch (err) {
    console.error(err);

    res.status(500).json({
      message: "Could not load documents.",
    });
  }
});

router.post("/", async (req, res) => {
  try {
    const document = await Document.create({
      title: req.body.title || "Untitled Document",
      owner: req.userId,
      content: "",
    });

    res.status(201).json(document);
  } catch (err) {
    console.error(err);

    res.status(500).json({
      message: "Could not create document.",
    });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const document = await Document.findById(req.params.id)
      .populate("owner", "name email");

    if (!document) {
      return res.status(404).json({
        message: "Document not found.",
      });
    }

    const hasAccess =
      document.owner._id.toString() === req.userId ||
      document.collaborators.some(
        (collaborator) =>
          collaborator.toString() === req.userId
      );

    if (!hasAccess) {
      return res.status(403).json({
        message: "You don't have access to this document.",
      });
    }

    res.json(document);
  } catch (err) {
    console.error(err);

    res.status(500).json({
      message: "Could not load document.",
    });
  }
});

router.put("/:id", async (req, res) => {
  try {
    const document = await Document.findById(req.params.id);

    if (!document) {
      return res.status(404).json({
        message: "Document not found.",
      });
    }

    if (document.owner.toString() !== req.userId) {
      return res.status(403).json({
        message: "Only the owner can rename this document.",
      });
    }

    const title = req.body.title?.trim();

    if (title) {
      document.title = title;
    }

    await document.save();

    res.json(document);
  } catch (err) {
    console.error(err);

    res.status(500).json({
      message: "Could not update document.",
    });
  }
});

// Share a document.
router.post("/:id/share", async (req, res) => {
  try {
    const email = req.body.email?.trim().toLowerCase();

    const document = await Document.findById(req.params.id);

    if (!document) {
      return res.status(404).json({
        message: "Document not found.",
      });
    }

    if (document.owner.toString() !== req.userId) {
      return res.status(403).json({
        message: "Only the owner can share this document.",
      });
    }

    const userToAdd = await User.findOne({ email });

    if (!userToAdd) {
      return res.status(404).json({
        message: "No user found with that email.",
      });
    }

    if (userToAdd._id.toString() === req.userId) {
      return res.status(400).json({
        message: "You already own this document.",
      });
    }

    if (document.collaborators.includes(userToAdd._id)) {
      return res.status(400).json({
        message: "This user already has access.",
      });
    }

    document.collaborators.push(userToAdd._id);

    await document.save();

    res.json({
      message: `Document shared with ${userToAdd.email}.`,
    });
  } catch (err) {
    console.error(err);

    res.status(500).json({
      message: "Could not share document.",
    });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    const document = await Document.findById(req.params.id);

    if (!document) {
      return res.status(404).json({
        message: "Document not found.",
      });
    }

    if (document.owner.toString() !== req.userId) {
      return res.status(403).json({
        message: "Only the owner can delete this document.",
      });
    }

    await document.deleteOne();

    res.json({
      message: "Document deleted.",
    });
  } catch (err) {
    console.error(err);

    res.status(500).json({
      message: "Could not delete document.",
    });
  }
});

module.exports = router;