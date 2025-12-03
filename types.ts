import React from 'react';

export interface Product {
  id: number;
  name: string;
  price: number;
  originalPrice?: number;
  image: string;
  discount?: string;
  tag?: string;
  description?: string;
  rating?: number;
  reviews?: number;
  category?: string;
  tags?: string[];
}

export interface Order {
  id: string;
  customer: string;
  location: string;
  amount: number;
  date: string;
  status: 'Pending' | 'Confirmed' | 'Shipped' | 'Delivered' | 'Cancelled';
  email?: string; // To link with registered user
}

export interface User {
  name: string;
  email: string;
  password?: string;
  phone?: string;
  address?: string;
  role?: 'customer' | 'admin';
}

export interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  colorClass: string;
}

export interface ChartData {
  name: string;
  value: number;
  [key: string]: string | number;
}

export interface ThemeConfig {
  primaryColor: string;
  secondaryColor: string;
  tertiaryColor: string;
  darkMode: boolean;
}