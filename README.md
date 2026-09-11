# INUNDRA

## Urban Flood Nowcasting & Decision Intelligence

> **Predicting Urban Inundation Before It Happens.**

INUNDRA is an urban flood nowcasting and decision-support platform designed to predict **street-level urban flooding before it occurs**.

The platform combines real-time rainfall information, high-resolution terrain data, urban surface characteristics, drainage-network conditions, and downstream water levels to estimate **where flooding may occur, when it may occur, and how severe it may become**.

---

## 🚨 Problem Statement

Urban flooding is a recurring problem in cities such as **Mumbai, Delhi, and Chennai**.

Traditional Numerical Weather Prediction (NWP) systems primarily provide rainfall forecasts. However, rainfall alone does not determine whether a particular street will flood.

Urban flooding can be influenced by:

- Intense and localized rainfall
- Micro-topography and low-lying areas
- Impervious urban surfaces
- Limited drainage capacity
- Blocked or overloaded drains
- Underground drainage networks
- Open drains and canals
- River and tidal water levels
- Downstream drainage conditions

This creates a need for a system that can translate rainfall forecasts into **street-level flood intelligence** with a short lead time.

---

## 💡 Our Solution

INUNDRA introduces a coupled urban flood intelligence framework that connects:

**Rainfall → Terrain → Surface Runoff → Drainage Network → Flood Prediction → Action**

Instead of only asking:

> "How much rain is expected?"

INUNDRA aims to answer:

- **WHERE** will flooding occur?
- **WHEN** is it likely to occur?
- **WHY** is the location vulnerable?
- **HOW DEEP** could the water become?
- **WHAT SHOULD PEOPLE DO?**

The system continuously updates flood intelligence as new rainfall observations, drainage conditions, water levels, and incident reports become available.

---

## 🎯 Key Features

### 🌧️ Real-Time Rainfall Intelligence

INUNDRA can integrate rainfall observations and forecast information from sources such as:

- Weather stations
- Airport observations
- Weather radar
- Rainfall nowcasts
- Short-term precipitation forecasts

This information is used to estimate rainfall intensity and spatial distribution.

---

### 🗺️ Street-Level Flood Prediction

INUNDRA aims to provide high-resolution flood predictions for urban areas.

The prediction layer can represent:

- Flood-prone streets
- Expected water depth
- Flood onset time
- Flood duration
- Risk severity
- Prediction confidence

The target prediction horizon is:

**0–3 hours**

---

### ⛰️ Terrain & Urban Surface Analysis

The system incorporates geographic and urban characteristics including:

- High-resolution DEM
- Elevation
- Slope
- Low-lying regions
- Roads
- Impervious surfaces
- Land-surface characteristics
- Soil information
- Drainage catchments

These factors help determine how rainfall becomes surface runoff and where water is likely to accumulate.

---

### 🚰 Dynamic Drainage Network Model

INUNDRA represents the urban drainage system as a graph.

#### Drainage Nodes

Nodes can represent:

- Manholes
- Drain inlets
- Junctions
- Pumping points
- Drainage outlets

#### Drainage Edges

Edges can represent:

- Underground pipes
- Open drains
- Canals
- Drainage channels

The model can estimate:

- Drainage capacity
- Flow through network segments
- Node stress
- Overcapacity
- Surcharge
- Potential backflow
- Drainage bottlenecks

---

### 🧱 Drainage Blockage Intelligence

Real-world drainage conditions can significantly affect flood risk.

INUNDRA can incorporate reports from:

- Citizens
- Municipal authorities
- Field teams
- Disaster-management personnel

Examples include:

- Garbage accumulation
- Blocked drains
- Damaged drainage infrastructure
- Overflowing drains
- Waterlogging observations

These reports can be used to update drainage conditions and improve subsequent flood predictions.

---

### 🌊 River & Tidal Conditions

Where applicable, INUNDRA can incorporate:

- River levels
- Canal levels
- Tidal conditions
- Downstream water levels

This is important because high downstream water levels can reduce drainage discharge and increase the probability of urban flooding.

---

### 🧠 Explainable Flood Intelligence

INUNDRA is designed not only to predict flooding but also to explain **why** a location is at risk.

For example:

> Heavy rainfall + low elevation + high impervious surface + drainage node approaching capacity + downstream blockage

can result in a higher flood risk.

An example explanation could be:

```text
Road X
    ↓
72 mm/hr rainfall
    ↓
High impervious surface
    ↓
Low-lying terrain
    ↓
Drain D-17 at 94% capacity
    ↓
Downstream blockage detected
    ↓
Predicted water depth: 18–25 cm
    ↓
Estimated onset: 42 minutes

## System Architecture 

                  ┌─────────────────────┐
                  │ Weather / Radar     │
                  │ Data Sources        │
                  └──────────┬──────────┘
                             │
                             ▼
                  ┌─────────────────────┐
                  │ Rainfall Nowcasting │
                  └──────────┬──────────┘
                             │
                             ▼
        ┌────────────────────────────────────────┐
        │      Rainfall–Terrain–Drainage         │
        │            Coupling Engine             │
        └────────────────────┬───────────────────┘
                             │
          ┌──────────────────┼──────────────────┐
          │                  │                  │
          ▼                  ▼                  ▼
     ┌─────────┐       ┌───────────┐      ┌───────────┐
     │   DEM   │       │   Urban   │      │ Drainage  │
     │ Terrain │       │  Surface  │      │  Network  │
     └─────────┘       └───────────┘      └───────────┘
                                                │
                                                ▼
                                      ┌─────────────────┐
                                      │ Dynamic Drainage│
                                      │  Digital Twin   │
                                      └────────┬────────┘
                                               │
                                               ▼
                                  ┌────────────────────────┐
                                  │ Street-Level Flood     │
                                  │ Prediction              │
                                  └───────────┬────────────┘
                                              │
                    ┌─────────────────────────┼──────────────────────┐
                    │                         │                      │
                    ▼                         ▼                      ▼
             ┌────────────┐          ┌──────────────┐       ┌──────────────┐
             │ Risk Map   │          │ Explainability│       │ Safe Routing │
             │ & Water    │          │ & Confidence │       │              │
             │ Depth      │          │ Engine        │       │              │
             └─────┬──────┘          └───────┬──────┘       └───────┬──────┘
                   │                         │                      │
                   └─────────────────────────┼──────────────────────┘
                                             ▼
                                  ┌─────────────────────┐
                                  │ INUNDRA GIS         │
                                  │ Decision Dashboard  │
                                  └──────────┬──────────┘
                                             │
                                             ▼
                                  Alerts / Decisions / API

        Citizen & Authority Reports
                     │
                     └──────────────► Model Update