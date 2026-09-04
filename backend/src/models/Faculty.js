const mongoose = require('mongoose');

const facultySchema = new mongoose.Schema(
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
      required: [true, 'Faculty name is required'],
      trim: true
    },
    email: {
      type: String,
      required: [true, 'Faculty email is required'],
      trim: true,
      lowercase: true
    },
    department: {
      type: String,
      required: [true, 'Department is required'],
      trim: true
    },
    specialization: {
      type: String,
      required: [true, 'Specialization is required'],
      trim: true
    },
    experience: {
      type: String,
      default: '5+ Years',
      trim: true
    },
    expertise: [
      {
        type: String,
        trim: true
      }
    ],
    assignedProjects: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Project'
      }
    ],
    isActive: {
      type: Boolean,
      default: true
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('Faculty', facultySchema);
