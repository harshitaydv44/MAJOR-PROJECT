const mongoose = require('mongoose');

const teamMemberSchema = new mongoose.Schema({
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student',
    required: true
  },
  role: {
    type: String,
    enum: [
      'Frontend',
      'Backend',
      'AI/ML',
      'Research',
      'Hardware',
      'Documentation',
      'Testing',
      'Team Lead'
    ],
    default: 'Research'
  }
});

const teamSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Team name is required'],
      trim: true
    },
    university: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    project: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Project'
    },
    facultyMentor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Faculty'
    },
    members: [teamMemberSchema]
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('Team', teamSchema);
