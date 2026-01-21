const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const validator = require('validator');

const userSchema = new mongoose.Schema({
    companyType: {
        type: String,
        required: [true, 'Company type is required'],
        enum: {
            values: ['sales', 'real-estate', 'telemarketing', 'agency'],
            message: 'Invalid company type. Must be one of: sales, real-estate, telemarketing, agency'
        },
        trim: true
    },
    name: {
        type: String,
        required: [true, 'Name is required'],
        trim: true,
        minlength: [2, 'Name must be at least 2 characters'],
        maxlength: [50, 'Name cannot exceed 50 characters'],
        validate: {
            validator: function(v) {
                return /^[a-zA-Z\s'-]+$/.test(v);
            },
            message: 'Name can only contain letters, spaces, hyphens, and apostrophes'
        }
    },
    lastname: {
        type: String,
        required: [true, 'Lastname is required'],
        trim: true,
        minlength: [2, 'Lastname must be at least 2 characters'],
        maxlength: [50, 'Lastname cannot exceed 50 characters'],
        validate: {
            validator: function(v) {
                return /^[a-zA-Z\s'-]+$/.test(v);
            },
            message: 'Lastname can only contain letters, spaces, hyphens, and apostrophes'
        }
    },
    email: {
        type: String,
        required: [true, 'Email is required'],
        unique: true,
        lowercase: true,
        trim: true,
        validate: {
            validator: function(v) {
                return validator.isEmail(v);
            },
            message: 'Please enter a valid email address'
        }
        // Index is defined below with userSchema.index() - no need for index: true here
    },
    password: {
        type: String,
        required: [true, 'Password is required'],
        minlength: [6, 'Password must be at least 6 characters'],
        maxlength: [100, 'Password cannot exceed 100 characters'],
        select: false // Don't return password by default in queries
    }
}, {
    timestamps: true, // Automatically adds createdAt and updatedAt
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// Hash password before saving (only if password is modified)
userSchema.pre('save', async function() {
    // Only hash the password if it has been modified (or is new)
    if (!this.isModified('password')) {
        return;
    }
    
    // Generate salt with 10 rounds
    const salt = await bcrypt.genSalt(10);
    // Hash password with salt
    this.password = await bcrypt.hash(this.password, salt);
});

// Hash password before updating (if password field is being updated)
userSchema.pre('findOneAndUpdate', async function() {
    const update = this.getUpdate();
    if (update && update.password) {
        const salt = await bcrypt.genSalt(10);
        update.password = await bcrypt.hash(update.password, salt);
        this.setUpdate(update);
    }
});

// Method to compare password
userSchema.methods.comparePassword = async function(candidatePassword) {
    if (!this.password) {
        throw new Error('Password not available for comparison');
    }
    return await bcrypt.compare(candidatePassword, this.password);
};

// Virtual for full name
userSchema.virtual('fullName').get(function() {
    return `${this.name} ${this.lastname}`;
});

// Remove password from JSON output (already handled by select: false, but extra safety)
userSchema.methods.toJSON = function() {
    const userObject = this.toObject();
    delete userObject.password;
    return userObject;
};

// Index for sorting by creation date
// Note: email already has index from unique: true, no need to add it again
userSchema.index({ createdAt: -1 });

module.exports = mongoose.model('User', userSchema);

