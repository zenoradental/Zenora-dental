# Auto Sync Script for GitHub Deployment (Polling Version)
$FolderToWatch = "d:\WEBSITES\THE ZEHOSP\lumora-dental"

# Ensure we start in the Git repository directory
Set-Location $FolderToWatch

Write-Host "Auto-deploy is ACTIVE (Polling mode)."
Write-Host "Watching $FolderToWatch..."
Write-Host "Every time you save a file, it will automatically push to GitHub!"
Write-Host "Press Ctrl+C in this terminal to stop watching."

while ($true) {
    # Run git status to see if there are any changes (modified, untracked, deleted)
    $status = git status --porcelain
    if ($status) {
        Write-Host "Changes detected! Waiting 3 seconds to bundle edits..."
        Start-Sleep -Seconds 3
        
        # Stage all changes
        git add -A
        
        # Commit changes
        $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
        git commit -m "Auto-deploy: $timestamp"
        
        # Push to GitHub
        Write-Host "Pushing to GitHub..."
        git push
        
        Write-Host "Successfully deployed to GitHub at $timestamp!"
        Write-Host "----------------------------------------"
    }
    
    # Wait 2 seconds before checking again
    Start-Sleep -Seconds 2
}
