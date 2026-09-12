const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema(
  {
    recipient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Recipient reference is required'],
      index: true
    },
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    senderName: {
      type: String,
      default: 'Delhi Societal Innovation Council'
    },
    type: {
      type: String,
      enum: [
        'CHALLENGE_SUBMITTED',
        'CHALLENGE_VALIDATED',
        'CHALLENGE_REJECTED',
        'NEEDS_INFORMATION',
        'UNIVERSITY_INTEREST',
        'CHALLENGE_ASSIGNED',
        'PROJECT_CREATED',
        'PROPOSAL_SUBMITTED',
        'PROPOSAL_APPROVED',
        'PROPOSAL_REVISION_REQUESTED',
        'INDUSTRY_INTEREST',
        'PARTNERSHIP_REQUEST',
        'MENTORSHIP_OFFER',
        'FUNDING_OFFER',
        'MILESTONE_DUE',
        'MILESTONE_REVIEWED',
        'MILESTONE_UPDATED',
        'MILESTONE_COMPLETED',
        'DELIVERABLE_APPROVED',
        'DELIVERABLE_REJECTED',
        'PROJECT_DELAYED',
        'PROJECT_COMPLETED',
        'VALIDATED',
        'REJECTED',
        'ASSIGNED',
        'STATUS_CHANGE',
        'STAGE_TRANSITION',
        'PROJECT_STAGE_CHANGED',
        'TEAM_INVITATION',
        'TEAM_INVITATION_ACCEPTED',
        'FACULTY_FEEDBACK',
        'MILESTONE_REVIEW_REQUESTED',
        'MILESTONE_DELIVERABLE_SUBMITTED',
        'MILESTONE_REVISION_REQUESTED',
        'INDUSTRY_REQUEST',
        'INDUSTRY_REQUEST_ACCEPTED',
        'PROJECT_DISCUSSION',
        'GENERAL'
      ],
      default: 'GENERAL',
      index: true
    },
    title: {
      type: String,
      required: [true, 'Notification title is required'],
      trim: true
    },
    message: {
      type: String,
      required: [true, 'Notification message is required'],
      trim: true
    },
    relatedEntity: {
      type: String,
      enum: ['Challenge', 'Project', 'Partnership', 'Milestone', 'Team', 'System', 'Industry'],
      default: 'Challenge'
    },
    relatedEntityId: {
      type: mongoose.Schema.Types.ObjectId,
      index: true
    },
    challenge: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Challenge'
    },
    project: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Project'
    },
    isRead: {
      type: Boolean,
      default: false,
      index: true
    },
    read: {
      type: Boolean,
      default: false
    }
  },
  {
    timestamps: true
  }
);

// Pre-save hook to keep read and isRead in sync
notificationSchema.pre('save', function (next) {
  if (this.isModified('isRead')) {
    this.read = this.isRead;
  } else if (this.isModified('read')) {
    this.isRead = this.read;
  }
  if (!this.challenge && this.relatedEntity === 'Challenge' && this.relatedEntityId) {
    this.challenge = this.relatedEntityId;
  }
  if (!this.project && this.relatedEntity === 'Project' && this.relatedEntityId) {
    this.project = this.relatedEntityId;
  }
  next();
});

module.exports = mongoose.model('Notification', notificationSchema);
