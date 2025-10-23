"use client";

import React from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

// Mock data
export const mockOverviewData = [
  { name: "Jan", users: 10, inquiries: 5 },
  { name: "Feb", users: 28, inquiries: 15 },
  { name: "Mar", users: 20, inquiries: 25 },
  { name: "Apr", users: 5, inquiries: 10 },
  { name: "May", users: 22, inquiries: 20 },
  { name: "Jun", users: 38, inquiries: 12 },
  { name: "Jul", users: 20, inquiries: 5 },
  { name: "Aug", users: 45, inquiries: 25 },
  { name: "Sep", users: 30, inquiries: 15 },
  { name: "Oct", users: 65, inquiries: 45 },
  { name: "Nov", users: 65, inquiries: 45 },
  { name: "Dec", users: 65, inquiries: 45 },
];

export const mockRevenueData = [
  { name: "Sun", revenue: 150 },
  { name: "Mon", revenue: 80 },
  { name: "Tue", revenue: 250 },
  { name: "Wed", revenue: 120 },
  { name: "Thu", revenue: 50 },
  { name: "Fri", revenue: 300 },
  { name: "Sat", revenue: 90 },
];

const CustomOverviewTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white text-new-grey px-6 py-3 rounded-lg shadow-lg text-sm">
        <p className="flex items-center">
          <span className="w-2 h-2 rounded-full bg-[#009499] mr-2"></span>
          {`Users: ${payload[0].value}`}
        </p>
        <p className="flex items-center">
          <span className="w-2 h-2 rounded-full bg-[#27ABEB] mr-2"></span>
          {`Inquiries: ${payload[1].value}`}
        </p>
      </div>
    );
  }
  return null;
};

const DashboardUI = ({ data }) => {
  // Generate chart data from Firebase data
  const generateChartData = (users, inquiries) => {
    const months = [
      'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
      'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
    ];

    const currentDate = new Date();
    const chartData = [];


    for (let i = 11; i >= 0; i--) {
      const date = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1);
      const monthName = months[date.getMonth()];
      
      // Count users created in this month
      const monthUsers = users?.filter(user => {
        if (!user.createdAt) return false;
        let userDate;
        
        // Handle different date formats
        if (user.createdAt.toDate) {
          // Firestore timestamp
          userDate = user.createdAt.toDate();
        } else {
          // String date
          userDate = new Date(user.createdAt);
        }
        
        const isMatch = userDate.getMonth() === date.getMonth() && 
               userDate.getFullYear() === date.getFullYear();
        return isMatch;
      }).length || 0;

      // Count inquiries created in this month
      const monthInquiries = inquiries?.filter(inquiry => {
        const dateField = inquiry.requestedAt || inquiry.createdAt;
        if (!dateField) return false;
        
        let inquiryDate;
        
        // Handle different date formats
        if (dateField.toDate) {
          // Firestore timestamp
          inquiryDate = dateField.toDate();
        } else {
          // String date
          inquiryDate = new Date(dateField);
        }
        
        const isMatch = inquiryDate.getMonth() === date.getMonth() && 
               inquiryDate.getFullYear() === date.getFullYear();
        return isMatch;
      }).length || 0;

      chartData.push({
        name: monthName,
        users: monthUsers,
        inquiries: monthInquiries
      });
    }

    return chartData;
  };

  const overviewData = data ? generateChartData(data.users, data.inquiries) : mockOverviewData;
  
  // If the generated data is all zeros, use mock data as fallback
  const hasData = overviewData.some(item => item.users > 0 || item.inquiries > 0);
  const finalData = hasData ? overviewData : mockOverviewData;

  return (
    <div>
      <div className="grid grid-cols-1 gap-4">
        <div className="lg:col-span-3 bg-white rounded-lg shadow-md p-4 md:p-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4">
            <div>
              <p className="text-xl font-semibold text-gray-500 mb-2 sm:mb-0">
                Statistic
              </p>
              <p className="font-semibold text-gray-400 mb-2 sm:mb-0">
                Users and Listings
              </p>
            </div>
          </div>

          {/* Line Chart */}
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={finalData}
                margin={{ top: 5, right: 10, left: -20, bottom: 5 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke="#e0e0e0"
                />
                <XAxis
                  dataKey="name"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 12, fill: "#6b7280" }}
                  dy={10}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 12, fill: "#6b7280" }}
                  domain={[0, 80]}
                  ticks={[0, 25, 50, 75]}
                  dx={-10}
                />
                <Tooltip
                  content={<CustomOverviewTooltip />}
                  cursor={{
                    stroke: "lightgray",
                    strokeWidth: 1,
                    strokeDasharray: "3 3",
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="users"
                  stroke="#009499"
                  strokeWidth={2.5}
                  dot={false}
                  activeDot={{ r: 6, strokeWidth: 0, fill: "#009499" }}
                />
                <Line
                  type="monotone"
                  dataKey="inquiries"
                  stroke="#27ABEB"
                  strokeWidth={2.5}
                  dot={false}
                  activeDot={{ r: 6, strokeWidth: 0, fill: "#27ABEB" }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardUI;
