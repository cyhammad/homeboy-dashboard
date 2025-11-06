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
          {`Listings: ${payload[1].value}`}
        </p>
      </div>
    );
  }
  return null;
};

const DashboardUI = ({ users = [], listings = [] }) => {
  // Generate chart data from real users and listings
  const overviewData = React.useMemo(() => {
    // Group data by month
    const currentDate = new Date();
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    
    const monthlyData = {};
    
    // Initialize all months with 0
    for (let i = 0; i < 12; i++) {
      monthlyData[months[i]] = { users: 0, listings: 0 };
    }

    // Process users data
    if (Array.isArray(users)) {
      users.forEach(user => {
        if (user?.createdAt) {
          try {
            const date = user.createdAt instanceof Date ? user.createdAt : new Date(user.createdAt);
            if (!isNaN(date.getTime())) {
              const month = months[date.getMonth()];
              if (monthlyData[month]) {
                monthlyData[month].users += 1;
              }
            }
          } catch (error) {
            console.warn('Error processing user date:', error);
          }
        }
      });
    }

    // Process listings data
    if (Array.isArray(listings)) {
      listings.forEach(listing => {
        if (listing?.createdAt) {
          try {
            const date = listing.createdAt instanceof Date ? listing.createdAt : new Date(listing.createdAt);
            if (!isNaN(date.getTime())) {
              const month = months[date.getMonth()];
              if (monthlyData[month]) {
                monthlyData[month].listings += 1;
              }
            }
          } catch (error) {
            console.warn('Error processing listing date:', error);
          }
        }
      });
    }

    // Convert to array format
    return months.map(month => ({
      name: month,
      users: monthlyData[month]?.users || 0,
      listings: monthlyData[month]?.listings || 0,
    }));
  }, [users, listings]);

  // Calculate max value for Y-axis domain
  const maxValue = React.useMemo(() => {
    const allValues = overviewData.flatMap(d => [d.users, d.listings]);
    const max = Math.max(...allValues, 0);
    // Round up to nearest 10, with minimum of 10
    return Math.max(Math.ceil(max / 10) * 10, 10);
  }, [overviewData]);

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
                data={overviewData}
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
                  domain={[0, maxValue]}
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
                  dataKey="listings"
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
