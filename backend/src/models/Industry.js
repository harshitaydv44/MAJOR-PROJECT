const mongoose = require('mongoose');

const industrySchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User reference is required'],
      unique: true
    },
    name: {
      type: String,
      required: [true, 'Organization name is required'],
      trim: true
    },
    organizationType: {
      type: String,
      enum: [
        'Industry',
        'Startup',
        'MSME',
        'CSR Organization',
        'Research Laboratory',
        'Innovation Hub'
      ],
      default: 'Industry'
    },
    industrySector: {
      type: String,
      default: 'Clean Energy, Smart Grids & Utilities',
      trim: true
    },
    location: {
      type: String,
      default: 'Netaji Subhash Place, Pitampura, Delhi',
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
    website: {
      type: String,
      default: 'https://www.tatapower-ddl.com',
      trim: true
    },
    expertise: [
      {
        type: String,
        trim: true
      }
    ],
    technologies: [
      {
        type: String,
        trim: true
      }
    ],
    resources: [
      {
        type: String,
        trim: true
      }
    ],
    fundingCapability: {
      maxGrantAmount: {
        type: Number,
        default: 2500000
      },
      csrBudgetAllocated: {
        type: Number,
        default: 10000000
      },
      fundingTypes: [
        {
          type: String,
          trim: true
        }
      ]
    },
    mentorshipCapability: {
      availableMentorsCount: {
        type: Number,
        default: 6
      },
      domains: [
        {
          type: String,
          trim: true
        }
      ],
      guidelines: {
        type: String,
        default: 'Quarterly field reviews and sprint architectural advisement.'
      }
    },
    implementationCapability: {
      fieldTrialSites: [
        {
          type: String,
          trim: true
        }
      ],
      pilotSupportLocations: [
        {
          type: String,
          trim: true
        }
      ],
      manufacturingCapacity: {
        type: String,
        default: 'Electronics PCB rapid assembly & high-voltage bench testing.'
      }
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('Industry', industrySchema);
