const mongoose = require('mongoose');

const partnershipSchema = new mongoose.Schema(
  {
    project: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Project',
      required: [true, 'Project reference is required']
    },
    industry: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Industry user reference is required']
    },
    industryProfile: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Industry'
    },
    university: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'University reference is required']
    },
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    team: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Team'
    },
    requestedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    requestedRole: {
      type: String,
      enum: ['STUDENT', 'INDUSTRY', 'UNIVERSITY', 'ADMIN'],
      default: 'STUDENT'
    },
    supportType: {
      type: String,
      enum: [
        'MENTORSHIP',
        'FUNDING',
        'TECHNOLOGY',
        'PROTOTYPING',
        'TESTING',
        'PILOT',
        'IMPLEMENTATION',
        'TECH_TRANSFER',
        'EXPRESS_INTEREST',
        'PILOT_SUPPORT'
      ],
      required: [true, 'Support type is required']
    },
    reason: {
      type: String,
      trim: true,
      default: ''
    },
    message: {
      type: String,
      trim: true,
      default: ''
    },
    description: {
      type: String,
      trim: true
    },
    resourcesOffered: [
      {
        type: String,
        trim: true
      }
    ],
    expectedInvolvement: {
      type: String,
      default: 'Co-development, technical supervision, and field pilot trials.',
      trim: true
    },
    fundingAmount: {
      type: Number,
      default: 0
    },
    assignedMentor: {
      name: { type: String, trim: true },
      email: { type: String, trim: true },
      designation: { type: String, trim: true },
      phone: { type: String, trim: true }
    },
    status: {
      type: String,
      enum: [
        'PENDING',
        'SUBMITTED',
        'UNDER_REVIEW',
        'ACCEPTED',
        'REJECTED',
        'ACTIVE',
        'COMPLETED'
      ],
      default: 'PENDING'
    },
    reviewNotes: {
      type: String,
      default: ''
    },
    reviewedAt: {
      type: Date
    }
  },
  {
    timestamps: true
  }
);

// Fallback to ensure description is never empty if reason or message provided
partnershipSchema.pre('validate', function (next) {
  if (!this.description) {
    this.description = this.message || this.reason || `${this.supportType} collaboration request`;
  }
  next();
});

module.exports = mongoose.model('Partnership', partnershipSchema);
