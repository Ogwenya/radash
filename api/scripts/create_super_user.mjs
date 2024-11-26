/* 
- THIS SCRIPT IS ONLY FOR INITIALIZING FIRST ADMIN IN THE DATABASE
- CAN BE DELETED AFTERWARDS
*/

import { input, password } from '@inquirer/prompts';
import validator from 'validator';
import * as mysql from 'mysql2/promise';
import * as bcrypt from 'bcrypt';
import * as dotenv from 'dotenv';

dotenv.config();

async function create_super_user() {
  const connection = await mysql.createConnection({
    host: process.env.DATABASE_HOST,
    user: process.env.DATABASE_USER,
    password: process.env.DATABASE_PASSWORD,
    database: process.env.DATABASE_NAME,
  });

  const validate_name = (value) => {
    if (value === '' || value.length < 2) {
      return 'Name must be 2 characters or more.';
    }
    return true;
  };

  const validate_email = (value) => {
    if (!validator.isEmail(value)) {
      return 'Provide a valid email';
    }
    return true;
  };

  const validate_password = (value) => {
    if (!validator.isStrongPassword(value)) {
      return 'Provide a strong password\nPassword must:\n- Be at least eight (8) characters long\n- Have at least one capital letter\n- Have at least one small letter\n- Have at least one number\n- Have at least one special character.';
    }
    return true;
  };

  const firstname = await input({
    message: 'Enter your firstname',
    validate: validate_name,
  });

  const lastname = await input({
    message: 'Enter your lastname',
    validate: validate_name,
  });

  const email = await input({
    message: 'Enter your email',
    validate: validate_email,
  });

  const password_input = await password({
    message: 'Enter your password',
    mask: '*',
    validate: validate_password,
  });

  const confirm_password = await password({
    message: 'Confirm password',
    mask: '*',
    validate: (value) => {
      if (value !== password_input) {
        return 'Passwords do not match.';
      }
      return true;
    },
  });

  try {
    const [rows] = await connection.execute(
      'SELECT * FROM user WHERE email = ?',
      [email],
    );

    if (rows.length > 0) {
      console.log('User with this email already exists.');
      await connection.end();
      return;
    }

    const salt = await bcrypt.genSalt(10);
    const hashed_password = await bcrypt.hash(password_input, salt);

    // Insert the super user into the database
    const [result] = await connection.execute(
      'INSERT INTO user (firstname, lastname, email, password, is_super_user) VALUES (?, ?, ?, ?, ?)',
      [firstname, lastname, email, hashed_password, true],
    );

    console.log(result);
  } catch (error) {
    console.error('Error creating superuser:', error);
  } finally {
    await connection.end();
  }
}

create_super_user();
