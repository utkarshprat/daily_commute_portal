const axios = require('axios');
const Commute = require('../models/Commute');

exports.getRoute = async (req, res) => {
  try {
    const { origin, destination } = req.body;
    const apiKey = process.env.GOOGLE_MAPS_API_KEY;

    const url = `https://maps.googleapis.com/maps/api/directions/json?origin=${encodeURIComponent(origin)}&destination=${encodeURIComponent(destination)}&key=${apiKey}`;
    const response = await axios.get(url);

    if (response.data.status !== 'OK') {
      return res.status(400).json({ message: 'Unable to fetch route data' });
    }

    const route = response.data.routes[0];
    if (!route) {
      return res.status(404).json({ message: 'No routes found for the given origin and destination' });
    }

    const leg = route.legs[0];
    const distance = leg.distance.value;
    const travelTime = leg.duration.value;

    res.json({
      message: 'Route fetched successfully',
      route,
      distance,
      travelTime,
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error while fetching route' });
  }
};

exports.saveCommuteHistory = async (req, res) => {
  try {
    const userId = req.userId;
    const { origin, destination, distance, travelTime } = req.body;

    const newCommute = new Commute({
      userId,
      origin,
      destination,
      distance,
      travelTime,
    });

    await newCommute.save();

    res.status(201).json({
      message: 'Commute saved successfully',
      commute: newCommute,
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error while saving commute history' });
  }
};

exports.getCommuteHistory = async (req, res) => {
  try {
    const userId = req.userId;
    const commutes = await Commute.find({ userId }).sort({ createdAt: -1 });

    res.status(200).json(commutes);
  } catch (error) {
    res.status(500).json({ message: 'Server error while fetching commute history' });
  }
};

exports.getStats = async (req, res) => {
  try {
    const userId = req.userId;
    const commutes = await Commute.find({ userId });

    if (commutes.length === 0) {
      return res.status(200).json({
        totalDistance: 0,
        averageTime: 0,
        commuteCount: 0,
      });
    }

    const totalDistance = commutes.reduce((sum, c) => sum + c.distance, 0);
    const totalTime = commutes.reduce((sum, c) => sum + c.travelTime, 0);
    const commuteCount = commutes.length;
    const averageTime = totalTime / commuteCount;

    res.status(200).json({
      totalDistance,
      averageTime,
      commuteCount,
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error while fetching commute stats' });
  }
};
