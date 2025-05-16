#!/bin/bash
# Test script for Notes API
# Make sure your NestJS application is running before executing these commands

# Set the base URL for the API
BASE_URL="http://localhost:3000"

echo "=== Testing Notes API ==="

# 1. Create a new note
echo -e "\n=== 1. Creating a new note ==="
CREATE_RESPONSE=$(curl -s -X POST "$BASE_URL/notes" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Shopping List",
    "content": "Milk, eggs, bread"
  }')
echo "Response: $CREATE_RESPONSE"

# Extract the ID from the created note for later use
NOTE_ID=$(echo $CREATE_RESPONSE | grep -o '"id":[0-9]*' | head -1 | cut -d':' -f2)
echo "Created note ID: $NOTE_ID"

# 2. Create another note for testing pagination and search
echo -e "\n=== 2. Creating a second note ==="
curl -s -X POST "$BASE_URL/notes" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Work Tasks",
    "content": "Finish project, attend meeting"
  }'

# 3. Create a third note with similar title for search testing
echo -e "\n=== 3. Creating a third note with similar title ==="
curl -s -X POST "$BASE_URL/notes" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Shopping Ideas",
    "content": "New shoes, jacket"
  }'

# 4. Get all notes
echo -e "\n=== 4. Getting all notes ==="
curl -s -X GET "$BASE_URL/notes" | json_pp

# 5. Get notes with pagination
echo -e "\n=== 5. Getting notes with pagination (page 1, limit 2) ==="
curl -s -X GET "$BASE_URL/notes/paginated?page=1&limit=2" | json_pp

# 6. Search notes by title
echo -e "\n=== 6. Searching notes by title (Shopping) ==="
curl -s -X GET "$BASE_URL/notes/search?title=Shopping" | json_pp

# 7. Search notes by title with pagination
echo -e "\n=== 7. Searching notes by title with pagination ==="
curl -s -X GET "$BASE_URL/notes/search/paginated?title=Shopping&page=1&limit=2" | json_pp

# 8. Get total count of notes
echo -e "\n=== 8. Getting total count of notes ==="
curl -s -X GET "$BASE_URL/notes/count" | json_pp

# 9. Get a note by ID
echo -e "\n=== 9. Getting a note by ID ($NOTE_ID) ==="
curl -s -X GET "$BASE_URL/notes/$NOTE_ID" | json_pp

# 10. Update a note
echo -e "\n=== 10. Updating a note ($NOTE_ID) ==="
curl -s -X PUT "$BASE_URL/notes/$NOTE_ID" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Updated Shopping List",
    "content": "Milk, eggs, bread, cheese"
  }' | json_pp

# 11. Get the updated note to verify changes
echo -e "\n=== 11. Getting the updated note ($NOTE_ID) ==="
curl -s -X GET "$BASE_URL/notes/$NOTE_ID" | json_pp

# 12. Delete a note
echo -e "\n=== 12. Deleting a note ($NOTE_ID) ==="
curl -s -X DELETE "$BASE_URL/notes/$NOTE_ID" -v

# 13. Try to get the deleted note (should return 404)
echo -e "\n=== 13. Trying to get the deleted note ($NOTE_ID) ==="
curl -s -X GET "$BASE_URL/notes/$NOTE_ID" -v

echo -e "\n=== Tests completed ==="
