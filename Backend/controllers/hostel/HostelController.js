const Hostel = require('../../models/hostel/HostelModel');

// @desc Add a new hostel listing (Owner)
// @route POST /api/hostel
// @access Private (Owner)
exports.addHostel = async (req, res) => {
    try {
        const { name, location, description, price, contact, gender, facilities, rooms, images } = req.body;
        
        const hostel = await Hostel.create({
            name,
            location,
            description,
            price,
            contact,
            gender,
            facilities,
            rooms,
            images,
            owner: req.user._id, // Set the owner from the authenticated user
            status: 'pending' // Initial status
        });

        res.status(201).json(hostel);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// @desc Get listings for the authenticated owner
// @route GET /api/hostel/mine
// @access Private (Owner)
exports.getMyHostels = async (req, res) => {
    try {
        const hostels = await Hostel.find({ owner: req.user._id });
        res.status(200).json(hostels);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc Get all approved hostels for display (Public)
// @route GET /api/hostel
// @access Public
exports.getHostels = async (req, res) => {
    try {
        const hostels = await Hostel.find({ status: 'approved' })
            .populate('owner', 'name username email')
            .sort({ createdAt: -1 });
        res.status(200).json(hostels);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc Get ALL hostels for admin (all statuses, with owner info)
// @route GET /api/hostel/admin/all
// @access Private (Admin)
exports.getAllHostelsAdmin = async (req, res) => {
    try {
        const hostels = await Hostel.find({})
            .populate('owner', 'name username email')
            .sort({ createdAt: -1 });
        res.status(200).json(hostels);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc Get single hostel details
// @route GET /api/hostel/:id
// @access Public
exports.getHostelById = async (req, res) => {
    try {
        const hostel = await Hostel.findById(req.params.id);
        if (!hostel) return res.status(404).json({ message: 'Hostel not found' });
        res.status(200).json(hostel);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc Approve or Reject a hostel listing (Admin)
// @route PUT /api/hostel/:id/status
// @access Private (Admin)
exports.updateHostelStatus = async (req, res) => {
    try {
        const { status } = req.body; // 'approved' or 'rejected'
        const hostel = await Hostel.findByIdAndUpdate(
            req.params.id,
            { status },
            { new: true }
        );
        if (!hostel) return res.status(404).json({ message: 'Hostel not found' });
        res.status(200).json(hostel);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// @desc Get all pending hostels for moderation (Admin)
// @route GET /api/hostel/admin/pending
// @access Private (Admin)
exports.getPendingHostels = async (req, res) => {
    try {
        const pending = await Hostel.find({ status: 'pending' })
            .populate('owner', 'name username email')
            .sort({ createdAt: -1 });
        res.status(200).json(pending);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc Approve a hostel listing (Admin)
// @route PUT /api/hostel/:id/approve
// @access Private (Admin)
exports.approveHostel = async (req, res) => {
    try {
        const hostel = await Hostel.findByIdAndUpdate(
            req.params.id,
            { status: 'approved' },
            { new: true }
        ).populate('owner', 'name username email');
        if (!hostel) return res.status(404).json({ message: 'Hostel not found' });
        res.status(200).json(hostel);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// @desc Reject a hostel listing (Admin)
// @route PUT /api/hostel/:id/reject
// @access Private (Admin)
exports.rejectHostel = async (req, res) => {
    try {
        const hostel = await Hostel.findByIdAndUpdate(
            req.params.id,
            { status: 'rejected' },
            { new: true }
        );
        if (!hostel) return res.status(404).json({ message: 'Hostel not found' });
        res.status(200).json(hostel);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// @desc Report a hostel listing
// @route PUT /api/hostel/:id/report
// @access Private
exports.reportHostel = async (req, res) => {
    try {
        const { reason } = req.body;
        const hostel = await Hostel.findByIdAndUpdate(
            req.params.id,
            { reported: true, reportReason: reason || 'Violation of terms' },
            { new: true }
        );
        if (!hostel) return res.status(404).json({ message: 'Hostel not found' });
        res.status(200).json({ message: 'Hostel reported successfully' });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// @desc Toggle featured status
// @route PUT /api/hostel/:id/feature
// @access Private (Admin)
exports.toggleFeatured = async (req, res) => {
    try {
        const hostel = await Hostel.findById(req.params.id);
        if (!hostel) return res.status(404).json({ message: 'Hostel not found' });
        hostel.isFeatured = req.body.featured !== undefined ? req.body.featured : !hostel.isFeatured;
        await hostel.save();
        res.status(200).json(hostel);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// @desc Dismiss a report flag (Admin)
// @route PUT /api/hostel/:id/dismiss-report
// @access Private (Admin)
exports.dismissReport = async (req, res) => {
    try {
        const hostel = await Hostel.findByIdAndUpdate(
            req.params.id,
            { reported: false, reportReason: '' },
            { new: true }
        );
        if (!hostel) return res.status(404).json({ message: 'Hostel not found' });
        res.status(200).json(hostel);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// @desc Update hostel (Owner)
// @route PUT /api/hostel/:id
// @access Private (Owner)
exports.updateHostel = async (req, res) => {
    try {
        const { name, location, description, price, contact, gender, facilities, rooms, images } = req.body;
        
        const hostel = await Hostel.findById(req.params.id);
        if (!hostel) return res.status(404).json({ message: 'Hostel not found' });

        // Check if the user is the owner
        if (hostel.owner.toString() !== req.user._id.toString()) {
            return res.status(401).json({ message: 'Not authorized to update this hostel' });
        }

        hostel.name = name || hostel.name;
        hostel.location = location || hostel.location;
        hostel.description = description || hostel.description;
        hostel.price = price || hostel.price;
        hostel.contact = contact || hostel.contact;
        hostel.gender = gender || hostel.gender;
        hostel.facilities = facilities || hostel.facilities;
        hostel.rooms = rooms || hostel.rooms;
        hostel.images = images || hostel.images;
        hostel.status = 'pending'; // Re-verify after update

        const updatedHostel = await hostel.save();
        res.status(200).json(updatedHostel);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// @desc Delete hostel (Owner or Admin)
// @route DELETE /api/hostel/:id
// @access Private
exports.deleteHostel = async (req, res) => {
    try {
        const hostel = await Hostel.findById(req.params.id);
        if (!hostel) return res.status(404).json({ message: 'Hostel not found' });

        const isOwner = hostel.owner.toString() === req.user._id.toString();
        const isAdmin = req.user.role === 'ADMIN' || req.user.role === 'admin';
        if (!isOwner && !isAdmin) {
            return res.status(401).json({ message: 'Not authorized' });
        }

        await hostel.deleteOne();
        res.status(200).json({ message: 'Hostel removed' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc Create a new review for a hostel
// @route POST /api/hostel/:id/reviews
// @access Private
exports.createHostelReview = async (req, res) => {
    try {
        const { rating, comment } = req.body;
        const hostel = await Hostel.findById(req.params.id);

        if (!hostel) {
            return res.status(404).json({ message: 'Hostel not found' });
        }

        const alreadyReviewed = hostel.ratings.find(
            (r) => r.user.toString() === req.user._id.toString()
        );

        if (alreadyReviewed) {
            alreadyReviewed.rating = Number(rating);
            alreadyReviewed.comment = comment;
        } else {
            const review = {
                user: req.user._id,
                userName: req.user.username || req.user.name,
                rating: Number(rating),
                comment,
            };
            hostel.ratings.push(review);
        }

        hostel.numReviews = hostel.ratings.length;
        hostel.averageRating =
            hostel.ratings.reduce((acc, item) => item.rating + acc, 0) /
            hostel.ratings.length;

        await hostel.save();
        res.status(201).json({ message: 'Review added' });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// @desc Get all reviews for admin moderation
// @route GET /api/hostel/admin/reviews
// @access Private (Admin)
exports.getAllReviewsAdmin = async (req, res) => {
    try {
        const hostels = await Hostel.find({ "ratings.0": { $exists: true } }).select('ratings name');
        let allReviews = [];
        
        hostels.forEach(h => {
           h.ratings.forEach(r => {
                allReviews.push({
                    ...r._doc,
                    hostelId: h._id,
                    hostelName: h.name
                });
           });
        });

        // Sort by newest
        allReviews.sort((a, b) => b.createdAt - a.createdAt);
        
        res.status(200).json(allReviews);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc Delete a review (Admin or Review Owner)
// @route DELETE /api/hostel/:hostelId/reviews/:reviewId
// @access Private
exports.deleteReview = async (req, res) => {
    try {
        const hostel = await Hostel.findById(req.params.hostelId);
        if (!hostel) return res.status(404).json({ message: 'Hostel not found' });

        const reviewId = req.params.reviewId;
        const review = hostel.ratings.id(reviewId);
        
        if (!review) return res.status(404).json({ message: 'Review not found' });

        const isReviewOwner = review.user.toString() === req.user._id.toString();
        const isAdmin = req.user.role === 'ADMIN' || req.user.role === 'admin';

        if (!isReviewOwner && !isAdmin) {
            return res.status(401).json({ message: 'Not authorized' });
        }

        hostel.ratings.pull(reviewId);
        hostel.numReviews = hostel.ratings.length;
        hostel.averageRating = hostel.ratings.length > 0 
            ? hostel.ratings.reduce((acc, item) => item.rating + acc, 0) / hostel.ratings.length
            : 0;

        await hostel.save();
        res.status(200).json({ message: 'Review removed' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
