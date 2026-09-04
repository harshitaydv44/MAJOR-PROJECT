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
    supportType: {
      type: String,
      enum: [
        'EXPRESS_INTEREST',
        'MENTORSHIP',
        'FUNDING',
        'TECHNOLOGY',
        'PROTOTYPING',
        'PILOT_SUPPORT'
      ],
      required: [true, 'Support type is required']
    },
    description: {
      type: String,
      required: [true, 'Partnership description is required'],
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
    status: {
      type: String,
      enum: [
        'SUBMITTED',
        'UNDER_REVIEW',
        'ACCEPTED',
        'REJECTED',
        'ACTIVE',
        'COMPLETED'
      ],
      default: 'SUBMITTED'
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

module.exports = mongoose.model('Partnership', partnershipSchema);
