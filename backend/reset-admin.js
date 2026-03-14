import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
dotenv.config();

mongoose.connect(process.env.MONGO_URI)
  .then(async () => {
    const db = mongoose.connection.db;
    const hashedPassword = await bcrypt.hash('adminpassword', 10);
    
    await db.collection('users').updateOne(
      { email: 'admin@ismo.ma' },
      { 
        $set: { 
          password: hashedPassword,
          role: 'admin',
          nom: 'Admin',
          prenom: 'ISMO',
          matricule: 'ADMIN001'
        } 
      },
      { upsert: true }
    );
    
    console.log('Admin password successfully reset to adminpassword');
    process.exit(0);
  })
  .catch(err => {
    console.error(err);
    process.exit(1);
  });
