const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema(
  {
    university: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'University reference is required']
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    name: {
      type: String,
      required: [true, 'Student name is required'],
      trim: true
    },
    email: {
      type: String,
      required: [true, 'Student email is required'],
      trim: true,
      lowercase: true
    },
    department: {
      type: String,
      required: [true, 'Department is required'],
      trim: true
    },
    year: {
      type: String,
      required: [true, 'Academic year is required'],
      default: '3rd Year B.Tech',
      trim: true
    },
    skills: [
      {
        type: String,
        trim: true
      }
    ],
    expertise: [
      {
        type: String,
        trim: true
      }
    ],
    areasOfInterest: [
      {
        type: String,
        trim: true
      }
    ],
    phone: {
      type: String,
      trim: true,
      default: ''
    },
    studentId: {
      type: String,
      trim: true,
      default: ''
    },
    course: {
      type: String,
      trim: true,
      default: 'B.Tech'
    },
    profileImage: {
      type: String,
      default: ''
    },
    bio: {
      type: String,
      trim: true,
      default: ''
    },
    innovationCredits: {
      type: Number,
      default: 0
    },
    assignedTeam: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Team'
    },
    isActive: {
      type: Boolean,
      default: true
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('Student', studentSchema);
