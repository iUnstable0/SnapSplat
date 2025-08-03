# SnapSplat

SnapSplat is a moodboard that brings people together

When you sign up and create an event, you'll get a unique QR code. You can share that QR code with your friends and once they join they can start snapping pictures!

All photos shows up on a shared board in real-time, and you can drag them around, draw stuff, and even add reactions and emojis!

you can:
drag, resize, rotate, crop, etc
draw and doodle!
add text/captions
snap directly or upload from gallery
add reactions and emojis
replay mode (watch the board evolve over time just like reddit r/place!!)
vote to remove inappropriate pics/doodles
and more!

# misc

How to migrate db

When in dev environment, run bun pm:migrate
and choose the option prisma migrate dev --create-only <migration-name>
choose a migration name
then once migration created, edit the migration file and change the migration to non destructive
run prisma migrate dev again
then push to github and merge with prod!

on prod, git pull, then prisma migrate deploy
and done!
optional: prisma db seed