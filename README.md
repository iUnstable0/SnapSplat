# SnapSplat

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