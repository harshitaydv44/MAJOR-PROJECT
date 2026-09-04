const mongoose = require('mongoose');

const facultySpecializationSchema = new mongoose.Schema({
  facultyName: { type: String, required: true },
  department: { type: String, required: true },
  specialization: { type: String, required: true },
  email: { type: String, default: '' }
});

const interestedChallengeSchema = new mongoose.Schema({
  challenge: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Challenge',
    required: true
  },
  expressedAt: {
    type: Date,
    default: Date.now
  },
  notes: {
    type: String,
    default: ''
  }
});

const universitySchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true
    },
    name: {
      type: String,
      required: [true, 'University name is required'],
      trim: true
    },
    campus: {
      type: String,
      default: 'Main Campus, Delhi',
      trim: true
    },
    district: {
      type: String,
      enum: [
        'Central Delhi',
        'East Delhi',
        'New Delhi',
        'North Delhi',
        'North East Delhi',
        'North West Delhi',
        'Shahdara',
        'South Delhi',
        'South East Delhi',
        'South West Delhi',
        'West Delhi'
      ],
      default: 'North West Delhi'
    },
    departments: [
      {
        type: String,
        trim: true
      }
    ],
    researchAreas: [
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
    labsAndFacilities: [
      {
        type: String,
        trim: true
      }
    ],
    innovationCentre: {
      type: String,
      default: 'Centre for Advanced Research & Municipal Technology Innovation',
      trim: true
    },
    incubationFacilities: {
      type: String,
      default: 'Technology Business Incubator (TBI) & Prototype Fabrication Cell',
      trim: true
    },
    facultySpecializations: [facultySpecializationSchema],
    interestedChallenges: [interestedChallengeSchema],
    studentTeamsCount: {
      type: Number,
      default: 14
    },
    facultyMentorsCount: {
      type: Number,
      default: 8
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('University', universitySchema);
