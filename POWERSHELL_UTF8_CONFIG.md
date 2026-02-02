# PowerShell UTF-8 Configuration Guide

## Why UTF-8 Configuration is Needed

PowerShell on Windows often defaults to legacy encodings like GBK or CP437, which can cause issues when:
- Processing files with international characters
- Working with scripts containing non-ASCII characters
- Interfacing with applications that expect UTF-8

## Manual PowerShell UTF-8 Configuration Steps

### Option 1: Set PowerShell Session Encoding (Temporary)
Run these commands in your current PowerShell session:

```powershell
# Set the encoding for the current session
[Console]::InputEncoding = [System.Text.Encoding]::UTF8
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8
$PSDefaultParameterValues['Out-File:Encoding'] = 'UTF8'
```

### Option 2: Configure PowerShell Profile (Persistent)
Create or edit your PowerShell profile:

1. Check your profile path:
   ```powershell
   $PROFILE
   ```

2. Create the profile if it doesn't exist:
   ```powershell
   if (!(Test-Path -Path $PROFILE)) {
       New-Item -ItemType File -Path $PROFILE -Force
   }
   ```

3. Add the following to your profile:
   ```powershell
   # Set UTF-8 as default encoding
   [Console]::InputEncoding = [System.Text.Encoding]::UTF8
   [Console]::OutputEncoding = [System.Text.Encoding]::UTF8
   $PSDefaultParameterValues['Out-File:Encoding'] = 'UTF8'
   ```

4. Reload your profile:
   ```powershell
   . $PROFILE
   ```

### Option 3: Registry Configuration (System-wide)
You can also set UTF-8 as default through registry settings:

1. Open Registry Editor (regedit)
2. Navigate to: `HKEY_CURRENT_USER\Console\%SystemRoot%_System32_WindowsPowerShell_v1.0_powershell.exe`
3. Set the "CodePage" value to `65001` (decimal for UTF-8)

## Using the Automated Script

We've provided a script to automate the configuration:

```powershell
# Run the configuration script
.\configure-powershell-utf8.ps1
```

## Verification

After configuration, verify the encoding:

```powershell
# Check current console encoding
[Console]::InputEncoding
[Console]::OutputEncoding

# Check PowerShell default encoding
$OutputEncoding
```

## Additional Tips

1. **Restart PowerShell** after making these changes for full effect
2. **For PostgreSQL specifically**, ensure your database and client also use UTF-8 encoding
3. **Check Windows locale settings** in Settings > Time & Language > Language & Region > Administrative language settings

## Troubleshooting

If you still experience encoding issues:

1. Check your system locale settings
2. Verify PostgreSQL is configured to use UTF-8
3. Try running PowerShell as Administrator when making registry changes
4. Use the `-Encoding` parameter explicitly when reading/writing files

## Running Our Scripts After Configuration

Once PowerShell is configured for UTF-8, you can run our database initialization script:

```powershell
.\init-postgres-db-final.ps1 "your_postgres_password"
```

Or use the SQL file directly:
```cmd
set PGPASSWORD=your_postgres_password
psql -U postgres -f "init_growth_tracker_db.sql"
```