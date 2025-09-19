// src/user/user.entity.ts (或者 src/entities/user.entity.ts)

import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('users') // 使用 @Entity('users') 来明确指定映射到数据库中的 'users' 表
export class User {
  @PrimaryGeneratedColumn() // 对应 SQL 中的 `id` INT NOT NULL AUTO_INCREMENT, PRIMARY KEY
  id: number;

  @Column({ length: 50, nullable: true }) // 对应 `username` VARCHAR(50) NOT NULL, UNIQUE KEY
  username: string;

  @Column({ length: 100, nullable: true }) // 对应 `email` VARCHAR(100) NOT NULL, UNIQUE KEY
  email: string;

  @Column({ length: 100, nullable: true }) // 对应 `phone` VARCHAR(100) NOT NULL, UNIQUE KEY
  phone: string;

  @Column({ length: 255, unique: true }) // 对应 `password` VARCHAR(255) NOT NULL
  openId: string;

  @CreateDateColumn({ type: 'timestamp' }) // 对应 `created_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP
  createdAt: Date; // 建议使用 camelCase 命名

  @UpdateDateColumn({
    type: 'timestamp',
  }) // 对应 `updated_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
  updatedAt: Date; // 建议使用 camelCase 命名

  @Column({ type: 'tinyint', default: 1 }) // 对应 `is_active` TINYINT(1) DEFAULT '1'
  isActive: boolean; // tinyint(1) 通常映射为 boolean
}
