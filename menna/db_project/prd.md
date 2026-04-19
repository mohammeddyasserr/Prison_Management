
CPMS_PRD
Centralized Prison Management System   |   Product Requirements Document

CENTRALIZED PRISON

MANAGEMENT SYSTEM

Product Requirements Document  |  v1.0


Project

Centralized Prison Management System (CPMS)

Version

1.0 — Initial Release

Status

Draft

Date

April 2026

Team

Mohammed · Youssef · Pavly · Menna · Malak

1. Product Overview
1.1 Goals & Objectives
1.2 Scope
2. System Structure
2.1 Physical Hierarchy
2.2 Prison Data Model
2.2.1 Core Facility Information
2.2.2 Blocks and Cells Information
2.2.3 Super Admin
2.2.4 Officers
2.2.5 Facility Features (Boolean Flags)
3. User Roles & Permissions
3.1 Super Admin
3.2 Prison Manager (Prison Admin)
3.3 Officer
3.4 Public User (Visit Request Portal)
3.5 Shift Management
3.5.1 Shift Assignment Rules
3.5.2 Shift Assignment Data Model
4. Inmate Management
4.1 Inmate Placement Workflow
4.1.1 Placement Criteria (Super Admin)
4.2 Inmate Data Model
4.2.1 Personal Information
4.2.2 Legal Case Information
4.3 Transfers
5. Visit Management
5.1 Public Visit Request Portal
5.2 Visitor Data Model
5.2 Visit Data Model
5.3 Legal Visits
6. Incident & Disciplinary Management
6.1 Incident Reports
6.2 Disciplinary Log
7. Health Care
7.1 Doctors
7.2 Visits Reporting
8. Machine Learning Features
8.1 Risk Behavior Prediction
8.2 Overcrowding Prediction
8.3 Recidivism Risk Scoring
9. Dashboard Specifications
9.1 Super Admin Dashboard
9.2 Prison Manager Dashboard
9.3 Officer Dashboard
10. Non-Functional Requirements
10.1 Security
10.2 Performance
10.3 Availability
10.4 Scalability
10.5 Compliance
11. Glossary

1. Product Overview
The Centralized Prison Management System (CPMS) is a unified digital platform designed to manage all aspects of prison administration across multiple correctional facilities. The system consolidates inmate records, staff management, security operations, inter-prison transfers, visit scheduling, and incident reporting into a single, role-based platform — with AI-powered predictive analytics layered on top.


Attribute

Detail

Product Name

Centralized Prison Management System (CPMS)

Primary Users

Super Admin, Prison Managers, Officers, Public (Visit Requests)

Architecture

Multi-prison, multi-role, centralized database

AI Features

Risk Prediction, Overcrowding Forecast, Recidivism Scoring

Access Model

Role-Based Access Control (RBAC)


1.1 Goals & Objectives
Centralize management of all prisons under a unified platform accessible by authorized roles.
Eliminate paper-based inmate, incident, and visit records with a fully digital workflow.
Enable data-driven decision-making through real-time dashboards and ML predictions.
Streamline inter-prison transfer requests, approvals, and inmate placement.
Provide a public-facing portal for submitting and tracking visit requests.
Ensure accountability through full audit logs of incidents, movements, and disciplinary actions.

1.2 Scope
In scope:

Multi-prison management with hierarchical structure (Prison → Block → Cell)
Three primary internal roles: Super Admin, Prison Manager, Officer
Public-facing Visit Request portal
Inmate lifecycle management (admission → placement → transfer → release)
Incident and disciplinary record keeping
ML-based predictive features (risk behavior, overcrowding, recidivism)

Out of scope (Phase 1):

Financial/payroll management for staff
Parole board integrations
Biometric access control hardware integration


2. System Structure
2.1 Physical Hierarchy
The system models the physical layout of the correctional estate as a three-level hierarchy:


Level

Entity

Description

Level 1

Prison / Facility

A standalone correctional institution with its own staff, blocks, and capacity.

Level 2

Block

A named wing or section within a prison (e.g., Block A — Maximum Security).

Level 3

Cell

An individual cell within a block with defined capacity and occupancy.


2.2 Prison Data Model
Each prison record stores the following attributes:


2.2.1 Core Facility Information
Field

Type

Description

Prison ID

Unique Identifier

Auto-generated unique ID for each prison.

Manager

Foreign Key

The officer who Manage

Name

String

Official name of the facility.

Location

Enum

City/Governorate where the facility is situated.

Type

Enum

e.g., Maximum Security, Minimum Security, Remand, Juvenile, Women's.

Security Level

Enum


Total Capacity

Integer

Maximum number of inmates the facility can hold.

Current Occupancy

Integer

Number of currently housed inmates (auto-computed).

2.2.2 Blocks and Cells Information
Field

Type

Description

Block ID

Unique Identifier

Auto-generated unique ID for each block.

Prison ID

Foreign Key


Capacity

Integer


Current occupancy

Integer


Security level

Enum


Number of cells

Integer


Field

Type

Description

Cell ID

Unique Identifier

Auto-generated unique ID for each prison.

Block ID

Foreign Key

Official name of the facility.

Prison Id

Foreign Key


Capacity

Integer


Current occupancy

Integer


2.2.3 Super Admin
Field

Type

Description

National ID

Unique Identifier


Name

String


Phone

String


Address

String


Email

String


Password

Password


2.2.4 Officers
Field

Type

Description

National ID

Unique Identifier


Prison ID

Foreign Key


Name

String


Address

String


Phone

String


Email

String


Password

Password


2.2.5 Facility Features (Boolean Flags)
Feature

Description

Infirmary / Hospital

Does the facility have a resident surgical or medical unit?

Workshops

Are there vocational training areas (carpentry, textiles, etc.)?

Agricultural Ward

Does the prison engage in farming or agricultural activities?

Visitation Hall

Does the facility have a dedicated family visitation hall, and what is its capacity?









3. User Roles & Permissions
CPMS uses Role-Based Access Control (RBAC). Every user belongs to exactly one role, and each role has a strictly defined set of permissions and a dedicated dashboard.

3.1 Super Admin
Super Admin

Description

The central authority who oversees all correctional facilities nationwide. Has read/write access to all prisons, all inmate records, and all system-level configurations.

Dashboard KPIs

Total prisoners per prison
Occupancy rate across all prisons
Transfer statistics (pending / approved / denied)
System-wide alerts (overcrowding, high-risk inmates)
Key Features & Permissions

Add, edit, and deactivate prison facilities
Assign inmates to specific prisons based on placement criteria
View real-time occupancy data for any prison, block, or cell
View, approve, and reject inter-prison transfer requests
View all inmate records, legal case files, and health data
Access all ML prediction outputs
Manage system-level user accounts and role assignments
3.2 Prison Manager (Prison Admin)
Prison Manager

Description

Manages the day-to-day operations of a single assigned prison. Has full visibility into inmates, staff, occupancy, and scheduling within their facility.

Dashboard KPIs

Occupancy rate by block and by cell
Active incidents count
Pending / approved visit requests
Upcoming releases (next 30 days)
Officer shift assignments
Key Features & Permissions

View all inmate profiles and legal case data for their prison
Access all ML prediction outputs
Assign inmates to specific blocks and cells
View all officers and doctors assigned to their prison
Add time Slots for the visits
Accept or reject public visit requests
View occupancy at block and cell level
Submit inter-prison transfer requests for inmates
View disciplinary logs and incident reports
Manage internal movement logs
3.3 Officer
Officer

Description

A guard or security officer assigned to one or more blocks within a prison. Responsible for reporting incidents and monitoring the cells under their supervision.

Dashboard KPIs

Occupancy of cells in their assigned block(s)
Recent incidents in their block
Today's scheduled movements
Active solitary confinement records
Key Features & Permissions

Report incidents: fights, self-harm, escape attempts
Log disciplinary actions and violation records
Record solitary confinement orders (up to 30 days)
Log internal movements (cell transfers) and external movements
View inmate profiles for inmates in their assigned block
Cannot approve visits or submit transfer requests

3.4 Public User (Visit Request Portal)
Any member of the public can access the Visit Request portal without creating an account. They submit a visit request by:

Entering the unique inmate ID of the person they wish to visit
Providing their own National ID, Full Name, relationship to the inmate, and contact information
Selecting from available pre-defined time slots
The prison manager reviews and approves or denies the request. The visitor is notified of the decision.

3.5 Shift Management
The Prison Manager is responsible for assigning officer shifts to blocks within their facility. Shifts are the primary mechanism by which blocks are staffed and monitored at all times.


Shift

Hours

Description

Morning Shift

06:00 – 14:00

Day-time operations, inmate activities, visits, and court movement scheduling.

Afternoon Shift

14:00 – 22:00

Evening supervision, incident monitoring, and lockdown procedures.

Night Shift

22:00 – 06:00

Overnight watch; reduced activity, emergency response readiness.


3.5.1 Shift Assignment Rules
Each block must have at least one officer assigned per shift at all times.
An officer can only be assigned to one block per shift slot.
The Prison Manager assigns shifts via the Shift Management page, selecting officer, block, shift type, and date range.
Officers can view their own upcoming shift schedule from their dashboard.
Shift history is logged and retained for audit purposes.

3.5.2 Shift Assignment Data Model
Field

Type

Description

Shift ID

Auto-generated

Unique identifier for each shift assignment.

Officer

Foreign Key

The officer assigned to the shift.

Block

Foreign Key

The block the officer is responsible for during this shift.

Shift Type

Enum

Morning / Afternoon / Night.

Date

Date

The calendar date of the shift.

Start Time

Time

Shift start time (auto-filled from shift type).

End Time

Time

Shift end time (auto-filled from shift type).




4. Inmate Management
4.1 Inmate Placement Workflow
The placement process follows a two-stage workflow:


Stage

Actor

Action

1. Prison Assignment

Super Admin

Assigns a newly admitted inmate to a specific prison based on placement criteria below.

2. Cell Placement

Prison Manager

Once the inmate arrives, the Prison Manager assigns them to a specific block and cell within the prison.


4.1.1 Placement Criteria (Super Admin)
The Super Admin evaluates the following factors when selecting a prison:

Location — proximity to the inmate's court jurisdiction or family region
Security Level — matching inmate risk profile to facility type (e.g., Maximum Security)
Legal Case & Sentence — nature of offense and sentencing requirements
Sentence Duration — long-term inmates may require specific facilities
Age — juvenile inmates must be placed in appropriate facilities
Health Conditions — inmates requiring medical care must be placed in prisons with infirmaries

4.2 Inmate Data Model
4.2.1 Personal Information
Field

Type

Notes

Unique Inmate ID

Auto-generated

System-generated identifier for internal use.

Full Name

String

As per National ID document.

Date of Birth

Date

Used for age calculation and juvenile classification.

Gender

Enum

Male / Female / Other.

Nationality

String

Country of citizenship.

Occupation

String

Civilian occupation prior to incarceration.

National ID

String

Government-issued national identification number.

Start Date

Date

Date of admission into the prison system.

Expected Release Date

Date

Calculated from sentence start date + duration.

Assigned Prison

Foreign Key

Links to the prison entity.

Assigned Block

Foreign Key

Links to the block entity within the prison.

Assigned Cell

Foreign Key

Links to the specific cell within the block.


4.2.2 Legal Case Information
Field

Type

Notes

Case Number

String

Official court case reference number.

Crime Type

Enum


Court Name

String

Name of the presiding court.

Sentence Duration

Duration

Total sentence length (e.g., 5 years, life).

Inmate ID

Foreign Key

Link to the inmate


4.3 Transfers
An inter-prison transfer can be requested by a Prison Manager for any inmate within their facility. The request is reviewed and approved or denied by the Super Admin.


Field

Type

Description

Transfer ID

Auto-generated


Requesting Prison

Foreign Key

The prison initiating the transfer request.

Destination Prison

Foreign Key

The proposed receiving facility.

Reason for Transfer

String

Clinical need, security reclassification, overcrowding, court order, etc.

Inmate ID

Foreign Key

The inmate subject to transfer.

Status

Enum

Pending / Approved / Denied.

Approval Date

Date

Date the Super Admin acted on the request.



5. Visit Management
5.1 Public Visit Request Portal
A publicly accessible page allows anyone to request a visit to an inmate. No account creation is required.


Required inputs from the visitor:

Inmate National ID (to identify the correct inmate)
Visitor's Full Name
Visitor's National ID
Relationship to Inmate (e.g., spouse, parent, sibling, friend, legal counsel)
Contact information (phone and email)
Selection from available time slots
5.2 Visitor Data Model
Field

Type

Description

Visit ID

Foreign Key

Unique visit reference.

National ID

String

Linked inmate record.

Full Name

String

Name of the person visiting.

Relationship

Enum

Spouse, Parent, Sibling, Friend, Lawyer, Other.

Phone

String

Phone number

Email

String

Email

5.2 Visit Data Model
Field

Type

Description

Visit ID

Auto-generated

Unique visit reference.

Inmate National ID

Foreign Key

Linked inmate record.

Date

Date

Scheduled date of visit.

Time Slot

Enum

Selected from pre-defined available slots.

Duration

Integer

Duration in minutes (e.g., 30, 60).

Status

Enum

Pending / Approved / Denied.

Denial Reason

String

If denied, reason provided to visitor.

Visit Type

Enum

Regular / Legal (lawyer consultation).


5.3 Legal Visits
Legal visits (lawyer–client consultations) are tracked separately from regular family visits to ensure attorney-client privilege. Legal visits:

Are flagged with Visit Type = Legal
Are not subject to the same scheduling restrictions as regular visits

6. Incident & Disciplinary Management
6.1 Incident Reports
Officers are responsible for reporting any security incidents that occur within their assigned blocks. Each report captures:


Field

Type

Description

Incident ID

Auto-generated

Auto-generated unique reference.

Type

Enum

Fight, Self-Harm, Escape Attempt, Property Damage, Assault on Staff, Other.

Date & Time

Time

Exact timestamp of the incident.

Location

Foreign Key

Prison, Block, and Cell where the incident occurred.

Inmates Involved

Foreign Key

Linked inmate IDs of all parties involved.

Reporting Officer

Foreign Key

The officer who filed the report.

Staff Involved

Foreign Key

Other officers or staff present during the incident.

Witnesses

Foreign Key

Names/IDs of inmate or staff witnesses.

Description

String

Narrative description of the incident.

Action Taken

String

Immediate response measures applied.


6.2 Disciplinary Log
All punishments administered to inmates must be recorded in the Disciplinary Log. This is a mandatory registry and cannot be deleted.


Field

Type

Description

Log ID

Auto-generated

Auto-generated reference.

Inmate ID

Foreign Key

The inmate receiving the disciplinary action.

Incident ID

Foreign Key

Reference to the triggering incident report.

Punishment Type

Enum

Loss of privileges, solitary confinement, transfer to high-security room, etc.

Solitary Confinement Duration

Integer

If applicable: duration in days (maximum 30 days as per regulations).

Imposed By

Foreign Key

The officer or manager who issued the punishment.

Date Imposed

Date

Date the punishment took effect.

End Date

Date

Date the punishment expires.

Notes

String

Any additional details or observations.


7. Health Care
7.1 Doctors
Field

Type

Description

National ID

Auto-generated

Auto-generated unique reference.

Name

Foreign Key


address

String


Phone

String


Prison ID

Foreign Key


7.2 Visits Reporting
Field

Type

Description

Visit ID

Auto-generated

Auto-generated unique reference.

Inmate ID

Foreign Key


Doctor

Foreign Key


Date & Time

Time

Exact timestamp of the incident.

Diagnosis

String

Description






8. Machine Learning Features
CPMS integrates three AI/ML prediction modules to support proactive prison administration.


8.1 Risk Behavior Prediction
Attribute

Detail

Purpose

Predict which inmates are likely to engage in violent or disruptive behavior.

Input Signals

Incident history, disciplinary records, sentence type, block environment, social visit frequency.

Output

Risk score (Low / Medium / High / Critical) with contributing factors.

Consumers

Super Admin dashboard, Prison Manager dashboard.

Update Frequency

Daily re-scoring for all active inmates.


8.2 Overcrowding Prediction
Attribute

Detail

Purpose

Forecast which facilities are likely to exceed capacity within a defined time window.

Input Signals

Current occupancy, upcoming releases, pending admissions, transfer trends, sentence durations.

Output

Per-prison occupancy forecast for the next 30, 60, and 90 days.

Consumers

Super Admin dashboard (system-wide view), Prison Manager (facility-specific).

Alert Threshold

Alert triggered when projected occupancy exceeds 90% of capacity.


8.3 Recidivism Risk Scoring
Attribute

Detail

Purpose

Estimate the likelihood that an inmate will re-offend after release.

Input Signals

Age, offense type, sentence duration, education level, visit frequency, vocational training participation, prior offenses.

Output

Recidivism score (0–100) and recommended rehabilitation interventions.

Consumers

Super Admin, Prison Manager, Social Workers.

Use Case

Prioritize rehabilitation resources and inform parole recommendations.



9. Dashboard Specifications
9.1 Super Admin Dashboard
Widget

Description

Total Prisoners per Prison

Bar chart showing inmate count for each facility.

Occupancy Rate

Gauge or percentage indicator per prison; color-coded (green < 75%, amber 75–90%, red > 90%).

Transfer Statistics

Counts of pending, approved, and denied transfer requests in the current period.

System Alerts

List of ML-generated flags: overcrowding risk, high-risk inmates, upcoming mass releases.


9.2 Prison Manager Dashboard
Widget

Description

Occupancy Rate

Block-by-block and cell-by-cell occupancy heatmap.

Active Incidents

Count of unresolved incidents in the facility, with links to reports.

Visit Requests

Queue of pending visit requests awaiting approval.

Upcoming Releases

List of inmates due for release within the next 30 days.

Pending Transfers

Outbound transfer requests awaiting Super Admin approval.


9.3 Officer Dashboard
Widget

Description

Block Occupancy

Cell-by-cell occupancy view for the officer's assigned block(s).

Recent Incidents

Incidents reported in the block within the past 7 days.

Today's Movements

Scheduled court appearances, hospital visits, or external movements for block inmates.

Solitary Confinement Records

Active solitary confinement orders and their expiry dates.



10. Non-Functional Requirements

10.1 Security
All data transmission must use TLS 1.2 or higher.
Role-Based Access Control (RBAC) enforced at both API and UI layer.
All user actions on inmate data must be logged in an immutable audit trail.
Disciplinary and legal visit records must be tamper-evident.
Session timeouts for idle users: 15 minutes for officer roles, 30 minutes for manager roles.

10.2 Performance
Dashboard pages must load within 3 seconds under normal load.
Inmate search results must return within 1 second for queries on up to 100,000 records.
ML model inference (risk scoring) must complete within 5 seconds per inmate.

10.3 Availability
Target uptime: 99.9% (excluding planned maintenance windows).
Planned maintenance must be scheduled during off-peak hours with advance notice.

10.4 Scalability
The system must support up to 500 concurrent users across all roles.
Must support adding new prisons without architectural changes.

10.5 Compliance
Must comply with national data protection regulations for sensitive personal data.
Legal visit records must maintain attorney-client privilege — inaccessible to officers.
Solitary confinement records must enforce the 30-day maximum as a system constraint.


11. Glossary
Term

Definition

CPMS

Centralized Prison Management System — the product described in this PRD.

Super Admin

The national-level system administrator who oversees all prisons.

Prison Manager

The administrator responsible for a single prison facility.

Officer

A security guard assigned to one or more blocks within a prison.

Block

A named wing or section within a prison (e.g., Block A).

Cell

An individual room within a block that houses one or more inmates.

Transfer Request

A formal request to move an inmate from one prison to another.

RBAC

Role-Based Access Control — a method of restricting access based on user role.

Recidivism

The tendency of a released inmate to re-offend and return to incarceration.

Solitary Confinement

Administrative segregation of an inmate from the general population.

Legal Visit

A confidential consultation between an inmate and their legal counsel.

ML

Machine Learning — AI techniques used for predictive analytics in CPMS.


End of Document — CPMS PRD v1.0

CPMS PRD v1.0   |   Confidential   |   Page