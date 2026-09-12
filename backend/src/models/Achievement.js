const mongoose = require('mongoose');

const achievementSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Student',
      required: true,
      index: true
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    project: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Project'
    },
    title: {
      type: String,
      required: [true, 'Achievement title is required'],
      trim: true
    },
    description: {
      type: String,
      required: [true, 'Achievement description is required'],
      trim: true
    },
    category: {
      type: String,
      enum: [
        'COMPLETED_PROJECT',
        'COMPLETED_MILESTONE',
        'PROTOTYPE_VALIDATED',
        'TEST_PASSED',
        'PILOT_DEPLOYED',
        'COMMUNITY_IMPACT',
        'PATENT_IP',
        'STARTUP_OUTCOME',
        'INNOVATION_CREDIT'
      ],
      required: true,
      index: true
    },
    credits: {
      type: Number,
      default: 0,
      min: 0
    },
    verifiedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    verifiedByName: {
      type: String,
      default: 'Delhi State Innovation Council'
    },
    verifiedRole: {
      type: String,
      enum: ['ADMIN', 'FACULTY', 'UNIVERSITY', 'SYSTEM'],
      default: 'SYSTEM'
    },
    verifiedAt: {
      type: Date,
      default: Date.now
    },
    evidenceUrl: {
      type: String,
      default: ''
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('Achievement', achievementSchema);
