# 成长追踪器 - 完整启动指南

## 问题诊断

如果您遇到 `pg_config : 无法将"pg_config"项识别为 cmdlet、函数、脚本文件或可运行程序的名称` 错误，这是因为PostgreSQL的安装路径未添加到系统PATH环境变量中。

## 解决步骤

### 步骤1: 确认PostgreSQL安装
1. 检查PostgreSQL是否已安装
   - 在"程序和功能"中查找PostgreSQL
   - 默认安装路径通常是 `C:\Program Files\PostgreSQL\[版本号]\`

### 步骤2: 添加PostgreSQL到PATH环境变量
1. 以管理员身份运行PowerShell或命令提示符
2. 找到PostgreSQL安装路径，例如 `C:\Program Files\PostgreSQL\15\bin`
3. 将该路径添加到系统PATH环境变量：
   - 打开"系统属性" -> "高级" -> "环境变量"
   - 在"系统变量"中找到"Path"，点击"编辑"
   - 点击"新建"，添加PostgreSQL的bin目录路径（如`C:\Program Files\PostgreSQL\15\bin`）
   - 点击"确定"保存

### 步骤3: 验证安装
1. 重新启动PowerShell
2. 运行以下命令验证安装：
   ```powershell
   pg_config --version
   ```

### 步骤4: 启动PostgreSQL服务
1. 检查PostgreSQL服务是否正在运行：
   ```powershell
   Get-Service | Where-Object {$_.Name -like "*postgresql*"}
   ```
2. 如果服务未运行，以管理员身份运行PowerShell并启动服务：
   ```powershell
   Start-Service *postgresql*
   ```

### 步骤5: 初始化数据库
运行以下命令创建数据库和表结构：
```powershell
.\init-postgres-db-en.ps1 "您的PostgreSQL密码"
```

### 步骤6: 启动应用
1. 启动API服务：
   ```cmd
   cd api
   npm install
   npm run dev
   ```
2. 启动前端应用：
   ```cmd
   npm run dev
   ```

## 使用脚本简化流程

我们提供了英文版的PowerShell脚本来帮助您完成上述步骤（所有脚本位于 `d:\Qoder` 目录）：

1. **诊断问题**: `diagnose-postgres-en.ps1` - 检查PostgreSQL安装状态
2. **检查服务**: `check-pg-service-en.ps1` - 检查PostgreSQL服务状态
3. **检查PostgreSQL**: `check-postgres-en.ps1` - 检查PostgreSQL安装和配置
4. **初始化数据库**: `init-postgres-db-en.ps1` - 创建数据库和表结构 (可能有编码问题)
5. **初始化数据库(修复版)**: `init-postgres-db-final.ps1` - 修复编码问题的数据库初始化脚本
6. **启动应用**: `start-app-en.ps1` - 一键启动整个应用

## 配置PowerShell以支持UTF-8编码（重要）

PowerShell在Windows上可能使用旧的字符编码（如GBK），这会导致脚本执行时出现乱码问题。请先配置PowerShell使用UTF-8编码：

### 自动配置
运行以下脚本自动配置PowerShell：
```powershell
.\configure-powershell-utf8.ps1
```

### 手动配置
或者，您可以手动设置PowerShell编码：
1. 以管理员身份运行PowerShell
2. 运行以下命令：
   ```powershell
   [Console]::InputEncoding = [System.Text.Encoding]::UTF8
   [Console]::OutputEncoding = [System.Text.Encoding]::UTF8
   $PSDefaultParameterValues['Out-File:Encoding'] = 'UTF8'
   ```

### 永久配置
为永久配置PowerShell使用UTF-8，请将上述命令添加到PowerShell配置文件中：
1. 创建或编辑配置文件：
   ```powershell
   if (!(Test-Path -Path $PROFILE)) { New-Item -ItemType File -Path $PROFILE -Force }
   ```
2. 编辑配置文件：
   ```powershell
   notepad $PROFILE
   ```
3. 添加UTF-8配置命令并保存

## 检查PostgreSQL连接和认证

如果遇到认证错误（如"Password authentication failed"），请先检查PostgreSQL连接状态：

```powershell
.\check-postgres-connection.ps1
```

这个脚本会检查：
- PostgreSQL服务是否正在运行
- PostgreSQL安装路径
- 连接命令是否可用
- 提供连接参数和故障排除建议

## 解决PostgreSQL认证问题

如果遇到认证错误，可以尝试以下方法：

### 方法1: 使用修复认证问题的脚本
```powershell
.\fix-postgres-auth.ps1 "您的PostgreSQL密码"
```

### 方法2: 手动验证认证
1. 打开命令提示符
2. 运行以下命令测试连接（将your_password替换为您的实际密码）：
   ```cmd
   set PGPASSWORD=your_password
   psql -U postgres -h localhost -p 5432 -c "SELECT version();"
   ```

### 方法3: 重置PostgreSQL密码
如果忘记密码，可以通过以下方式重置：
1. 以管理员身份运行命令提示符
2. 停止PostgreSQL服务：`net stop postgresql-x64-XX` (XX是版本号)
3. 以单用户模式启动PostgreSQL：
   ```cmd
   cd "C:\Program Files\PostgreSQL\XX\bin"
   postgres --single -D "C:\Program Files\PostgreSQL\XX\data" postgres
   ```
4. 在出现的提示符中执行：
   ```sql
   ALTER USER postgres PASSWORD 'new_password';
   \q
   ```
5. 重启PostgreSQL服务

### 方法4: 使用数据库设置助手
运行设置助手脚本来引导您完成设置：
```powershell
.\setup-helper.ps1
```

### 方法5: 检查pg_hba.conf配置
如果认证仍然失败，可能需要检查PostgreSQL的认证配置：
1. 找到pg_hba.conf文件（通常在`C:\Program Files\PostgreSQL\18\data\`目录下）
2. 用文本编辑器以管理员身份打开该文件
3. 确保文件中有类似以下的行：
   ```
   # TYPE  DATABASE        USER            ADDRESS                 METHOD
   host    all             all             127.0.0.1/32            md5
   host    all             all             ::1/128                 md5
   ```
4. 保存文件并重启PostgreSQL服务

## 直接使用SQL文件初始化数据库（推荐方法）

如果PowerShell脚本仍有问题，您可以直接使用psql命令和SQL文件初始化数据库：

1. 将PostgreSQL的bin目录添加到PATH环境变量
2. 打开命令提示符或PowerShell（已配置UTF-8）
3. 运行以下命令（请替换your_password为您的PostgreSQL密码）：
   ```cmd
   set PGPASSWORD=your_password
   psql -U postgres -f "d:\Qoder\init_growth_tracker_db.sql"
   ```

### 简化的一键命令
您也可以使用以下命令一次性完成数据库初始化：
```cmd
cd /d "D:\Qoder" && SET PGPASSWORD=your_password && "C:\Program Files\PostgreSQL\18\bin\psql" -U postgres -f "init_growth_tracker_db.sql" && SET PGPASSWORD=
```

## 常见问题解答

**Q: 仍然收到'命令未找到'错误**
A: 请确保已重启PowerShell以加载新的环境变量，或尝试重新安装PostgreSQL并在安装过程中选择将工具添加到PATH。

**Q: 无法连接到数据库**
A: 确认PostgreSQL服务正在运行，并检查密码是否正确。

**Q: 端口被占用**
A: 确认没有其他PostgreSQL实例在运行，或尝试使用不同的端口。

## 故障排除

如果仍有问题，请运行以下命令（在 `d:\Qoder` 目录中）：
```powershell
.\diagnose-postgres-en.ps1
```
此脚本将详细检查您的PostgreSQL安装状态并提供解决方案建议。

## 脚本使用示例

在 `d:\Qoder` 目录中运行以下命令：

1. **检查服务状态**:
   ```powershell
   .\check-pg-service-en.ps1
   ```

2. **检查PostgreSQL安装**:
   ```powershell
   .\check-postgres-en.ps1
   ```

3. **诊断问题**:
   ```powershell
   .\diagnose-postgres-en.ps1
   ```

4. **初始化数据库** (需要提供PostgreSQL密码):
   ```powershell
   .\init-postgres-db-final.ps1 "your_password_here"
   ```

所有脚本文件都位于 `d:\Qoder` 目录中，并且使用英文字符以避免编码问题。