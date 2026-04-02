const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

// Import models
const User = require('./models/laundry/UserModels');
const Pharmaceutical = require('./models/health/PharmaceuticalModel');
const Doctor = require('./models/health/DoctorModel');
const Inventory = require('./models/health/InventoryModel');

const MONGODB_URI = 'mongodb+srv://admin:xRLfibGWd5Jzy0im@cluster0.ucmx19s.mongodb.net/student_living';

const seedHealthManagement = async () => {
    try {
        await mongoose.connect(MONGODB_URI);
        console.log('✅ Connected to MongoDB\n');

        // Clear existing health management data
        console.log('🧹 Clearing existing data...');
        await User.deleteMany({ 
            $or: [
                { username: { $in: ['john_doe', 'jane_smith', 'mike_johnson', 'dr_smith', 'dr_johnson', 'dr_williams', 'pharma_admin_1', 'pharma_admin_2'] } },
                { role: 'DOCTOR' },
                { username: { $regex: '^pharma_admin_' } }
            ]
        });
        await Pharmaceutical.deleteMany({});
        await Doctor.deleteMany({});
        await Inventory.deleteMany({});

        // ========== CREATE TEST USERS (STUDENTS) ==========
        console.log('\n📝 Creating student accounts...');
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash('password123', salt);

        const students = [
            {
                name: 'John Doe',
                username: 'john_doe',
                email: 'john@studentliving.com',
                password: hashedPassword,
                role: 'USER',
                isApproved: true,
                phone: '+94771234567'
            },
            {
                name: 'Jane Smith',
                username: 'jane_smith',
                email: 'jane@studentliving.com',
                password: hashedPassword,
                role: 'USER',
                isApproved: true,
                phone: '+94771234568'
            },
            {
                name: 'Mike Johnson',
                username: 'mike_johnson',
                email: 'mike@studentliving.com',
                password: hashedPassword,
                role: 'USER',
                isApproved: true,
                phone: '+94771234569'
            }
        ];

        const createdStudents = await User.insertMany(students);
        console.log(`✅ Created ${createdStudents.length} student accounts`);
        createdStudents.forEach(student => {
            console.log(`   - ${student.name} (${student.email})`);
        });

        // ========== CREATE DOCTOR USERS ==========
        console.log('\n👨‍⚕️ Creating doctor accounts...');
        const doctors = [
            {
                name: 'Dr. Smith',
                username: 'dr_smith',
                email: 'dr.smith@hospital.com',
                password: hashedPassword,
                role: 'DOCTOR',
                isApproved: true,
                phone: '+94771111111'
            },
            {
                name: 'Dr. Johnson',
                username: 'dr_johnson',
                email: 'dr.johnson@hospital.com',
                password: hashedPassword,
                role: 'DOCTOR',
                isApproved: true,
                phone: '+94771111112'
            },
            {
                name: 'Dr. Williams',
                username: 'dr_williams',
                email: 'dr.williams@hospital.com',
                password: hashedPassword,
                role: 'DOCTOR',
                isApproved: true,
                phone: '+94771111113'
            }
        ];

        const createdDoctors = await User.insertMany(doctors);
        console.log(`✅ Created ${createdDoctors.length} doctor accounts`);
        createdDoctors.forEach(doctor => {
            console.log(`   - ${doctor.name} (${doctor.email})`);
        });

        // ========== CREATE PHARMACY ADMIN USERS ==========
        console.log('\n🧪 Creating pharmacy admin accounts...');
        const pharmacyAdmins = [
            {
                name: 'Pharmaceutical Admin One',
                username: 'pharma_admin_1',
                email: 'pharma.admin1@studentliving.com',
                password: hashedPassword,
                role: 'ADMIN',
                isApproved: true,
                phone: '+94772222221'
            },
            {
                name: 'Pharmaceutical Admin Two',
                username: 'pharma_admin_2',
                email: 'pharma.admin2@studentliving.com',
                password: hashedPassword,
                role: 'ADMIN',
                isApproved: true,
                phone: '+94772222222'
            }
        ];

        const createdPharmacyAdmins = await User.insertMany(pharmacyAdmins);
        console.log(`✅ Created ${createdPharmacyAdmins.length} pharmacy admin accounts`);
        createdPharmacyAdmins.forEach(admin => {
            console.log(`   - ${admin.name} (${admin.email})`);
        });

        // ========== CREATE DOCTOR PROFILES ==========
        console.log('\n🏥 Creating doctor profiles...');
        const doctorProfiles = [
            {
                user: createdDoctors[0]._id,
                firstName: 'Smith',
                lastName: 'James',
                specialization: 'General Practitioner',
                registrationNumber: 'MD-GP-001',
                licenseNumber: 'LICENSE-001',
                phone: '+94771111111',
                officeLocation: 'Medical Center, Block A',
                isAvailable: true,
                consultationFee: 500,
                status: 'Approved',
                availability: [
                    {
                        dayOfWeek: 'Monday',
                        startTime: '09:00',
                        endTime: '17:00',
                        slotDuration: 30
                    },
                    {
                        dayOfWeek: 'Wednesday',
                        startTime: '10:00',
                        endTime: '16:00',
                        slotDuration: 30
                    },
                    {
                        dayOfWeek: 'Friday',
                        startTime: '09:00',
                        endTime: '17:00',
                        slotDuration: 30
                    }
                ]
            },
            {
                user: createdDoctors[1]._id,
                firstName: 'Johnson',
                lastName: 'Michael',
                specialization: 'Other',
                registrationNumber: 'MD-PT-001',
                licenseNumber: 'LICENSE-002',
                phone: '+94771111112',
                officeLocation: 'Children\'s Hospital',
                isAvailable: true,
                consultationFee: 600,
                status: 'Approved',
                availability: [
                    {
                        dayOfWeek: 'Tuesday',
                        startTime: '10:00',
                        endTime: '18:00',
                        slotDuration: 30
                    },
                    {
                        dayOfWeek: 'Thursday',
                        startTime: '09:00',
                        endTime: '17:00',
                        slotDuration: 30
                    },
                    {
                        dayOfWeek: 'Saturday',
                        startTime: '10:00',
                        endTime: '14:00',
                        slotDuration: 30
                    }
                ]
            },
            {
                user: createdDoctors[2]._id,
                firstName: 'Williams',
                lastName: 'Sarah',
                specialization: 'Other',
                registrationNumber: 'MD-CD-001',
                licenseNumber: 'LICENSE-003',
                phone: '+94771111113',
                officeLocation: 'Heart Care Center',
                isAvailable: true,
                consultationFee: 800,
                status: 'Approved',
                availability: [
                    {
                        dayOfWeek: 'Monday',
                        startTime: '10:00',
                        endTime: '16:00',
                        slotDuration: 30
                    },
                    {
                        dayOfWeek: 'Thursday',
                        startTime: '09:00',
                        endTime: '17:00',
                        slotDuration: 30
                    }
                ]
            }
        ];

        const createdDoctorProfiles = await Doctor.insertMany(doctorProfiles);
        console.log(`✅ Created ${createdDoctorProfiles.length} doctor profiles`);
        createdDoctorProfiles.forEach(doc => {
            console.log(`   - Dr. ${doc.firstName} ${doc.lastName} (${doc.specialization})`);
        });

        // ========== CREATE PHARMACEUTICALS ==========
        console.log('\n💊 Creating pharmaceutical items...');
        const pharmaceuticals = [
            {
                name: 'Paracetamol 500mg',
                category: 'pain_reliever',
                type: 'Normal',
                description: 'Pain and fever relief',
                price: 50,
                dosage: '500mg',
                manufacturer: 'PharmaCorp',
                expiryDate: new Date('2027-12-31'),
                stockQuantity: 100,
                minStockLevel: 20
            },
            {
                name: 'Ibuprofen 400mg',
                category: 'pain_reliever',
                type: 'Normal',
                description: 'Anti-inflammatory pain reliever',
                price: 75,
                dosage: '400mg',
                manufacturer: 'MedLabs',
                expiryDate: new Date('2027-12-31'),
                stockQuantity: 80,
                minStockLevel: 15
            },
            {
                name: 'Amoxicillin 500mg',
                category: 'antibiotics',
                type: 'Normal',
                description: 'Antibiotic for bacterial infections',
                price: 150,
                dosage: '500mg',
                manufacturer: 'MedLabs',
                expiryDate: new Date('2027-06-30'),
                stockQuantity: 45,
                minStockLevel: 10
            },
            {
                name: 'Cetirizine 10mg',
                category: 'topical',
                type: 'Normal',
                description: 'Allergy relief antihistamine',
                price: 100,
                dosage: '10mg',
                manufacturer: 'PharmaCorp',
                expiryDate: new Date('2027-12-31'),
                stockQuantity: 60,
                minStockLevel: 12
            },
            {
                name: 'Vitamin C 1000mg',
                category: 'vitamin',
                type: 'Normal',
                description: 'Immune system supplement',
                price: 120,
                dosage: '1000mg',
                manufacturer: 'HealthPlus',
                expiryDate: new Date('2028-12-31'),
                stockQuantity: 150,
                minStockLevel: 30
            },
            {
                name: 'Omeprazole 20mg',
                category: 'antacid',
                type: 'Normal',
                description: 'Acid reflux relief',
                price: 200,
                dosage: '20mg',
                manufacturer: 'MedLabs',
                expiryDate: new Date('2027-08-31'),
                stockQuantity: 35,
                minStockLevel: 8
            },
            {
                name: 'Cough Syrup',
                category: 'cold_medicine',
                type: 'Normal',
                description: 'Relief for cough and cold',
                price: 180,
                dosage: '100ml',
                manufacturer: 'PharmaCorp',
                expiryDate: new Date('2027-12-31'),
                stockQuantity: 40,
                minStockLevel: 10
            },
            {
                name: 'Insulin Injection',
                category: 'other',
                type: 'Critical',
                description: 'Diabetes management injection',
                price: 2500,
                dosage: '100IU/ml',
                manufacturer: 'Novo Nordisk',
                expiryDate: new Date('2026-12-31'),
                stockQuantity: 8,
                minStockLevel: 3
            },
            {
                name: 'EpiPen Auto-Injector',
                category: 'other',
                type: 'Critical',
                description: 'Emergency epinephrine for allergic reactions',
                price: 5000,
                dosage: '0.3mg',
                manufacturer: 'Mylan',
                expiryDate: new Date('2027-06-30'),
                stockQuantity: 5,
                minStockLevel: 2
            },
            {
                name: 'Metformin 500mg',
                category: 'other',
                type: 'Normal',
                description: 'Type 2 diabetes management',
                price: 120,
                dosage: '500mg',
                manufacturer: 'MedLabs',
                expiryDate: new Date('2027-10-31'),
                stockQuantity: 70,
                minStockLevel: 15
            }
        ];

        const createdPharmaceuticals = await Pharmaceutical.insertMany(pharmaceuticals);
        console.log(`✅ Created ${createdPharmaceuticals.length} pharmaceutical items`);
        createdPharmaceuticals.forEach(pharma => {
            console.log(`   - ${pharma.name} (${pharma.category}) - Type: ${pharma.type}`);
        });

        // ========== CREATE INVENTORY ENTRIES ==========
        console.log('\n📦 Creating inventory entries...');
        const inventoryEntries = createdPharmaceuticals.map(pharma => ({
            pharmaceutical: pharma._id,
            currentStock: pharma.stockQuantity,
            minThreshold: pharma.minStockLevel,
            maxStock: pharma.stockQuantity * 2,
            reorderQuantity: Math.floor(pharma.stockQuantity * 0.5),
            lastRestockDate: new Date(),
            transactions: [
                {
                    type: 'Purchase',
                    quantity: pharma.stockQuantity,
                    reason: 'Initial stock',
                    performedBy: createdStudents[0]._id
                }
            ]
        }));

        const createdInventories = await Inventory.insertMany(inventoryEntries);
        console.log(`✅ Created ${createdInventories.length} inventory entries`);

        // ========== SUMMARY ==========
        console.log('\n' + '='.repeat(60));
        console.log('🎉 HEALTH MANAGEMENT SUBSYSTEM SEEDING COMPLETED!');
        console.log('='.repeat(60));
        console.log('\n📊 Summary:');
        console.log(`   ✅ Students Created: ${createdStudents.length}`);
        console.log(`   ✅ Doctors Created: ${createdDoctorProfiles.length}`);
        console.log(`   ✅ Pharmacy Admins Created: ${createdPharmacyAdmins.length}`);
        console.log(`   ✅ Pharmaceuticals Created: ${createdPharmaceuticals.length}`);
        console.log(`   ✅ Inventory Entries Created: ${createdInventories.length}`);

        console.log('\n🔐 Test Credentials:');
        console.log('\n   Student Login:');
        students.forEach(student => {
            console.log(`   - Email: ${student.email}`);
            console.log(`     Password: password123\n`);
        });

        console.log('   Doctor Login:');
        doctors.forEach(doctor => {
            console.log(`   - Email: ${doctor.email}`);
            console.log(`     Password: password123\n`);
        });

        console.log('   Pharmacy Admin Login:');
        pharmacyAdmins.forEach(admin => {
            console.log(`   - Email: ${admin.email}`);
            console.log(`     Password: password123\n`);
        });

        console.log('\n📋 Notes:');
        console.log('   - All passwords are: password123');
        console.log('   - Students, doctors, and pharmacy admins are all seeded as approved');
        console.log('   - Doctors are pre-approved (status: Approved)');
        console.log('   - Availability already set for doctors');
        console.log('   - Pharmaceuticals include Normal and Critical types');
        console.log('   - Critical items: Insulin Injection, EpiPen Auto-Injector\n');

        process.exit(0);
    } catch (error) {
        console.error('❌ Error seeding health management data:', error);
        process.exit(1);
    }
};

// Run seeding
seedHealthManagement();
