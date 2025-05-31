// // models/Event.js
// const mongoose = require('mongoose');

// const EventSchema = new mongoose.Schema({
//     title: {
//         type: String,
//         required: [true, 'Please add a title'],
//         trim: true
//     },
//     description: {
//         type: String,
//         required: [true, 'Please add a description']
//     },
//     date: {
//         type: Date,
//         required: [true, 'Please add an event date']
//     },
//     time: { // Adding time as per typical event needs
//         type: String,
//         required: [true, 'Please add an event time']
//     },
//     location: {
//         type: String,
//         required: [true, 'Please add a location']
//     },
//     imageURL: {
//         type: String,
//     },
//     organizer: { // Link to the User who created the event
//         type: mongoose.Schema.ObjectId,
//         ref: 'User',
//         required: true
//     },
//     // You can add more fields like capacity, attendees list, imageURL, etc. later
//     attendees: [{ type: mongoose.Schema.ObjectId, ref: 'User' }],
//     capacity: Number,
//     price: Number,
//     category: String,
//     createdAt: {
//         type: Date,
//         default: Date.now
//     }
// });

// module.exports = mongoose.model('Event', EventSchema);

const mongoose = require('mongoose');

const EventSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Please add a title'],
        trim: true,
        maxlength: [100, 'Title cannot be more than 100 characters']
    },
    description: {
        type: String,
        required: [true, 'Please add a description'],
        maxlength: [1000, 'Description cannot be more than 1000 characters']
    },
    date: {
        type: Date,
        required: [true, 'Please add an event date']
    },
    time: { 
        type: String,
        required: [true, 'Please add an event time'],
        validate: {
            validator: function(v) {
                // Simple regex for 24-hour or 12-hour time format (HH:mm or HH:mm AM/PM)
                return /^([01]\d|2[0-3]):([0-5]\d)(\s?[APMapm]{2})?$/.test(v);
            },
            message: props => `${props.value} is not a valid time format!`
        }
    },
    location: {
        type: String,
        required: [true, 'Please add a location'],
        trim: true
    },
    imageURL: {
        type: String,
        // validate: {
        //     validator: function(v) {
        //         if (!v) return true; // allow empty
        //         return /^https?:\/\/.+\.(jpg|jpeg|png|webp|avif|gif|svg)$/.test(v);
        //     },
        //     message: props => `${props.value} is not a valid image URL!`
        // }
    },
    organizer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    attendees: [
        { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
    ],
    capacity: {
        type: Number,
        min: [1, 'Capacity must be at least 1'],
        default: 0 // 0 means unlimited or not set
    },
    price: {
        type: Number,
        min: [0, 'Price cannot be negative'],
        default: 0 // Free event by default
    },
    category: {
        type: String,
        trim: true,
        enum: ['Conference', 'Workshop', 'Meetup', 'Webinar', 'Concert', 'Party', 'Other'],
        default: 'Other'
    },
    isVirtual: {
        type: Boolean,
        default: false
    },
    virtualLink: {
        type: String,
        validate: {
            validator: function(v) {
                if (!v) return true;
                return /^https?:\/\/.+/.test(v);
            },
            message: props => `${props.value} is not a valid URL!`
        }
    },
    status: {
        type: String,
        enum: ['Scheduled', 'Cancelled', 'Postponed', 'Completed'],
        default: 'Scheduled'
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date
    }
});

// Middleware to update `updatedAt` on every save
EventSchema.pre('save', function(next) {
    this.updatedAt = Date.now();
    next();
});

module.exports = mongoose.model('Event', EventSchema);
