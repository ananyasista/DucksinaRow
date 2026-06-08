# 🦆 Ducks in a Row

A roommate management mobile application designed to help college students and young adults organize shared living responsibilities, reduce conflict, and maintain healthy roommate relationships.

Built as a Senior Project at the University of Florida, Ducks in a Row centralizes household management through shared calendars, chore tracking, inventory management, and roommate preference matching.

## 📖 Overview

Living with roommates can be challenging. Miscommunication about chores, scheduling conflicts, forgotten household supplies, and mismatched expectations often create unnecessary stress.

Ducks in a Row provides a centralized platform where roommates can:

- Coordinate schedules
- Manage recurring chores
- Track shared inventory
- View roommate preferences
- Stay organized through a shared household dashboard

The goal is simple: help roommates stay on the same page and preserve relationships while living together.

## ✨ Features

### 🏠 Household Management

- Create a new household or join an existing one with a unique household code
- View roommate profiles and household information
- Manage shared resources across a household

### 📅 Shared Calendar

- Create household events
- View events in Day, 3-Day, Week, Month, or Agenda views
- Filter events by roommate
- Optional roommate approval workflow for events
- Create, edit, and delete events

### ✅ Chore Management

- Create individual or household chores
- Assign chores to roommates
- Configure recurring chore schedules
- Automatic chore rotation between roommates
- Search and filter chores
- Track completion status

### 📦 Inventory Tracking

- Track shared household items
- Monitor quantities and restock needs
- Record the most recent roommate who replenished an item
- Search and filter inventory items
- Create, edit, and delete inventory records

### 👤 Living Preferences

- Complete a roommate lifestyle survey
- Store living preferences and habits
- View roommate preferences for increased compatibility
- Update profile and preference information

### 📊 Home Dashboard

- Weekly overview of household activity
- Upcoming events
- Pending approvals
- Chores due soon
- Household summary information

## 🛠 Tech Stack

### Frontend

- React Native
- TypeScript
- Expo
- Axios

### Backend

- Django
- Django REST Framework (DRF)

### Database

- Django ORM
- Relational Database Design

### Design & Development Tools

- Figma
- Git
- GitHub

### Libraries

- react-native-big-calendar

## Application Walkthrough

## Login & Signup

<img width="951" height="913" alt="Login & Signup" src="https://github.com/user-attachments/assets/959a5d89-7b7b-43e2-816d-c8ce58e1aa2c" />


Users first opening Ducks in a Row will interact with the Login page. They can login with their email and password and then be redirected to the Home page with a welcome message. If a user is new, they can click on sign up and be redirected to the Sign Up page. In Sign Up, they have the option to join an existing house, where if they select yes they will input a valid house code. If not, they will enter a household name and when they sign up the program will create a unique house code that other users can enter to join the same household. From there, the user is redirected to the living preferences survey and upon completion or skipping the survey are redirected to the home page.

## Profile

<img width="1049" height="1168" alt="Profile" src="https://github.com/user-attachments/assets/58b3d452-87cf-422b-bef7-ed17a2e9862d" />

The middle column features the Profile tab in the application. Users are able to see three main sections: Your Profile, Roommates, and Living Preferences. By clicking on the yellow highlighted pencil (circled for diagram visibility; yellow circle not in application) the user is directed to the edit page for Your Profile or Living Preferences respectively. In Your Roommates, a user can also click on a roommates icon and see an overlaid icon with all of their roommates living preferences.

## Calendar

<img width="724" height="421" alt="Home Dashboard to Calendar" src="https://github.com/user-attachments/assets/28af37a7-bbb6-4ff5-a6da-713f06f9bdda" />


From the Home page, users can click on either of the pending events tiles to be redirected to the Calendar page in "All Events" view. The first tile is "Your approvals needed" and optionally be displayed if other roommates in the household have created events that are pending your response on approved/denied. In a similar vain, the "Your events missing approvals" will optionally be displayed if the user has future events that require roommate approval and any roommates are still pending a response.

The second and third photo feature the user view of Calendar "All Events" where a user can see "Needs Approval" for events their roommate has created that require their response. Then "Your Events" with any of their upcoming events. Finally there is "Upcoming Events in Your House" which shows event tiles of all events upcoming in the house. If the user owns the event, they will see the title of the event followed by an "Approved" or "Pending" or "Denied" label depending on the status of the roommate approvals.

<img width="474" height="771" alt="Calendar Menu" src="https://github.com/user-attachments/assets/f43f6e84-b98f-4dd7-a7c8-9b4f110e4eb2" />

In Calendar, the upper right corner features a stack menu that the user can click into to see their different view options. There is "Today" which will return them to today's date and if it is in "All Events" view it will switch to the "Week" view. There is also a day, 3 day, week, and month view for the calendar and all events to see all the future events in the calendar as a list of organized event tiles.


<img width="724" height="375" alt="Calendar Filtering" src="https://github.com/user-attachments/assets/fc8a95fe-8c88-4cc7-bd85-190c2c75d568" />

From day, 3 day, week, and month view, the user has the option to filter the events displayed by roommate. The first example showcases "all" where all events in the household will be displayed. The second and third showcase selected "Sofia" and "Elle" respectively. Every user in the household is assigned a profile color, which is then used in the calendar to assign the associated filter color and any event created by that roommate. Finally, the fourth screenshots shows the ability to select multiple people to filter by.


<img width="834" height="1035" alt="Create New Event Demo" src="https://github.com/user-attachments/assets/5c423bcb-f63f-47c6-bae1-022fda5c077c" />

In any of the Calendar pages, the user will see a green circular plus arrow in the bottom right corner. If pressed, this displays a modal form to create an event. The user can input a title description, date, location, and whether it needs roommate approval. There is an "All-Day" switch, which if selected removes the option to input a start and end time and will allow only start and end days. The bottom two examples show what the user will see when selecting a day and time.

<img width="1174" height="1149" alt="Event Viewing & Editing" src="https://github.com/user-attachments/assets/a2dc2ae3-1850-4cf2-8f7c-5fe7681a8d3a" />


A user can access more information about an event from the Calendar page by either clicking into an event tile from the "All Events" view or from clicking onto the calendar event in the other views. From the home page, under "Upcoming Week Events" the user can also click into see more detail.

The informational panel that pops up will show information such as title, the optional description and location, time and who created the events. If an event requires approval, then the "Roommate Approval" section will also be displayed with an overview of the status of roommate approval. A yellow profile tile and hourglass indicates a pending response, a red profile and X depicts a denial, and a green profile and checkmark indicates an approval.

If the user created and owns the event, then they will see in the highlighted upper right corner the deleted trash can. They will also see a pencil, which when pressed will open "Edit Event" and they will be able to edit the event information.

## Inventory

<img width="987" height="1206" alt="Add & Edit Item" src="https://github.com/user-attachments/assets/184cbaf3-2cd1-4c92-9843-db0c301e24fe" />


From the Items tab, a user can see any shared items in the household. The item tiles are displayed, with the default behavior is for items that need restock to appear at the top of the list. These items are highlighted in an orange tone and have the toggle for "Restock Needed?" turned on.

Users can use the plus arrow in the bottom right to open a modal that allows them to create a new shared item with a name, description, quantity, and location.

Users can also click into an existing shared item to see more information and also edit or delete the item in the upper right. The pencil icon opens up the edit modal, featuring the same field options as create items.

<img width="941" height="550" alt="Inventory Search Filter" src="https://github.com/user-attachments/assets/d7447a87-3b69-4b05-9bc6-033365dd50df" />

Users from the Inventory tab can also search for shared items. The search will automatically filter for partial matches as the diagram displays first a partial map for "s" and then for "so" and returns the item tiles that match.

<img width="867" height="572" alt="Inventory Filter Tab" src="https://github.com/user-attachments/assets/bb1cda2b-fea3-439d-a584-faa755a94ee1" />

Users from inventory can also filter. In the example, a user chooses to filter by "Sofia" and when it is applied, the filter closes and the items displayed will match the filters selected.

<img width="1188" height="560" alt="Inventory Item Mark Needs Purchased" src="https://github.com/user-attachments/assets/d96a0d1d-9406-43c8-97f0-ee5aabfe1a20" />

If a user clicks into the item tile to see more details, they can see who last purchased it. In the example, the user logged in is "Sofia" and so when they switch the item from "Restock Needed?" being true/turned on to being false/turned off then the item will automatically track that the last person who purchased it was the user "Sofia". It will also change the main inventory display from orange with the restock needed set to true, to the instock color of grey and restock needed set to false.

## Chores

<img width="639" height="1107" alt="Chore Completion Dashboard" src="https://github.com/user-attachments/assets/5a778714-9678-433f-a202-790ef3e09523" />


From the home page, a user is able to see the chores they have upcoming that week. They are also able to mark them complete and if all are done they will see a message outlining "Your to-do list is empty!". If they mark a chore complete in the home page, they can see that chore complete in the chores tab as well. If they mistakenly clicked complete, they can either tap the check mark or tap into a chore and have the option to mark it as incomplete as well.

<img width="1004" height="1206" alt="Chore Add & Edit" src="https://github.com/user-attachments/assets/a51c65f3-150e-4ad3-ba36-b549ef1d152e" />

From the chores tab, a user is able to see all the chores in their household. Chores that are due that day or past due are highlighted in orange and brought to the top of the to-do list. They can click into a chore to see more detail. They have the option to mark it complete/incomplete or edit or delete a chore.

The green plus in the bottom right allows a user to add a new chore. Chores can have a name, description, a date/time, location, and set a repeat schedule. Users can optionally select to rotate the chore and choose which roommates it rotates through and how frequently.

<img width="546" height="557" alt="Chore Completion & Rotation" src="https://github.com/user-attachments/assets/ea2f7040-2f78-4394-b9af-2b5b01f8ce2e" />

A chore that is marked complete and is either due or past due, will then be marked complete within the to-do list and automatically rotated to the next person on the schedule. In this example, clean bathroom is due today and when Leyna marks it complete, the chore automatically sets to the next week and to Ananya as the next recipient of the chore.

<img width="597" height="550" alt="Chore Search Filter" src="https://github.com/user-attachments/assets/84cf515d-b524-453f-83e9-9986f837ab0b" />

Users can also search via the search bar for a chore by its name. It will include all partial matches and any completed chores as well. Chores that are not complete default to always being shown at the top of any chores to do list.

<img width="867" height="572" alt="Chore Built-in Filters" src="https://github.com/user-attachments/assets/62f689e9-5dce-4bbb-a4a3-d196b12027ed" />

Users can also click into the filters and choose to filter by assignee, location, due date range, or completion status. In the example, we are filtering by Elle's incomplete chores that are due in the future. When applied, we then see the result shows Elle's outstanding chore for Laundry.

## 🏗 System Architecture

React Native Mobile App -> Django REST API  -> Django ORM  -> Relational Database

Core entities include:

- User
- Household
- LivingPreferences
- CalendarEvent
- EventApproval
- Chore
- Chore Rotation
- InventoryItem

Each user belongs to a household, ensuring household-specific access control and data privacy.

## 🚀 Getting Started

### Backend Setup

Navigate to the backend directory:

cd backend

Create and activate a virtual environment:

python -m venv venv

Windows:

venv\\Scripts\\activate

Mac/Linux:

source venv/bin/activate

Install dependencies:

pip install -r requirements.txt

Run migrations:

python manage.py makemigrations api  
python manage.py migrate  
python manage.py create_test_data

Start the server:

python manage.py runserver

For mobile testing:

python manage.py runserver 0.0.0.0:8000

### Frontend Setup

Navigate to the frontend directory:

cd ducks-in-a-row

Install dependencies:

npm install

Start Expo:

npx expo start

Update the API URL in:

api/client.ts

Replace the mobile URL with your local machine's IP address:

const WEB_API_URL = "<http://127.0.0.1:8000/api>";  
const MOBILE_API_URL = "http://YOUR_LOCAL_IP:8000/api";

## 🧪 Testing

### Unit Testing

- Django model validation
- Serializer testing
- Utility function testing
- Frontend component validation

### Integration Testing

- API endpoint testing
- Authentication workflows
- Household-based access control
- Frontend/backend communication

### System Testing

- End-to-end user workflows
- Event creation and approval flows
- Chore management functionality
- Inventory management functionality

### Acceptance Testing

- User registration and login
- Household creation and joining
- Calendar workflows
- Profile management
- Household data visibility

## 🎯 Project Goals

The primary objectives of Ducks in a Row were to:

- Improve organization among roommates
- Increase accountability for shared responsibilities
- Reduce conflict through transparency
- Encourage roommate compatibility through shared preferences
- Provide an intuitive mobile-first experience

## 👥 Team

### Area 52

- Leyna Huynh - Backend Engineer & UI/UX Designer
- Sofia Lynch - Frontend Engineer & SCRUM Master
- Ananya Sista - Frontend Engineer & Git Engineer
- Elle Strauss - Database Engineer & UI/UX Designer

### Faculty Advisor

Dr. Jaime Ruiz
