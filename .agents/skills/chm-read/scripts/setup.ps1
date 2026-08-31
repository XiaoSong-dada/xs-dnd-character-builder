# CHM AI Reader Setup Script

Function Write-Host-Color {
    param([string]$Message, [string]$Color = "Cyan")
    Write-Host ">>> $Message" -ForegroundColor $Color
}

Write-Host-Color "Checking environment..."

# 1. Check for Node.js
try {
    $nodeVersion = node -v 2>$null
    if ($nodeVersion) {
        Write-Host-Color "Node.js is already installed ($nodeVersion)" "Green"
    } else {
        throw "Node not found"
    }
} catch {
    Write-Host-Color "Node.js not found. Attempting to install via winget..." "Yellow"
    
    # Check if winget exists
    if (Get-Command winget -ErrorAction SilentlyContinue) {
        Write-Host-Color "Installing Node.js (LTS)..."
        winget install OpenJS.NodeJS.LTS --silent --accept-package-agreements --accept-source-agreements
        
        if ($LASTEXITCODE -eq 0) {
            Write-Host-Color "Node.js installed successfully. You may need to restart your terminal." "Green"
            Write-Host-Color "Please restart this script after terminal restart to install dependencies." "Yellow"
            exit
        } else {
            Write-Host-Color "Failed to install Node.js via winget. Please install it manually from https://nodejs.org/" "Red"
            exit
        }
    } else {
        Write-Host-Color "winget not found. Please install Node.js manually from https://nodejs.org/" "Red"
        exit
    }
}

# 2. Install dependencies
Write-Host-Color "Installing npm dependencies (cheerio, argparse, turndown, iconv-lite, jschardet)..."
npm.cmd install cheerio argparse turndown iconv-lite jschardet

if ($LASTEXITCODE -eq 0) {
    Write-Host-Color "Dependencies installed successfully!" "Green"
} else {
    Write-Host-Color "Failed to install dependencies via npm." "Red"
    exit
}

Write-Host-Color "Setup complete! You can now use: node main.js build <chm_file>" "Green"
