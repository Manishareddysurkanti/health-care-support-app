const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const bcrypt = require('bcryptjs');

const Staff = sequelize.define('Staff', {
  _id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      notEmpty: true,
    },
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    validate: {
      isEmail: true,
    },
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false,
  },
}, {
  hooks: {
    beforeSave: async (staff) => {
      if (staff.changed('password')) {
        staff.password = await bcrypt.hash(staff.password, 10);
      }
    },
  },
  timestamps: true,
});

Staff.prototype.comparePassword = function (candidate) {
  return bcrypt.compare(candidate, this.password);
};

module.exports = Staff;
