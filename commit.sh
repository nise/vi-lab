git add .
inputStr=$(zenity --entry --title="Commit Message" --text="Enter a commit message" --entry-text "minor updates")
git commit -m "$inputStr"; #git push origin master

