# Execute na pasta vive-ai-photobooth:
# powershell -NoProfile -ExecutionPolicy Bypass -File .\Configurar-Fal.ps1
# A chave e solicitada no computador e nao e exibida.
# Salva a configuracao em .vive-fal.override.json e inclui esse arquivo
# nos comandos Compose futuros por meio de COMPOSE_FILE no .env.
# Preserva os arquivos Compose ja usados e cria .env.antes-fal.bak.
# Nao faz chamadas pagas de geracao nem valida a chave na API externa.
param([switch]$ReutilizarChave)
$ErrorActionPreference = 'Stop'
$utf8 = New-Object System.Text.UTF8Encoding($false)
$root = (Get-Location).Path
$overlayPath = Join-Path $root '.vive-fal.override.json'
$envPath = Join-Path $root '.env'
$backupPath = Join-Path $root '.env.antes-fal.bak'

function Invoke-DockerText {
    param([string[]]$DockerArguments)
    $result = & docker @DockerArguments
    if ($LASTEXITCODE -ne 0) { throw 'O Docker nao concluiu o comando. Confira se o Docker Desktop esta iniciado.' }
    return ($result -join "`n")
}
function Set-DotEnvValue {
    param([string]$Content, [string]$Name, [string]$Value)
    $pattern = '(?m)^\s*(?:export\s+)?' + [regex]::Escape($Name) + '\s*=.*$'
    $line = $Name + "='" + $Value + "'"
    $without = [regex]::Replace($Content, $pattern, '')
    return $without.TrimEnd() + "`r`n" + $line + "`r`n"
}

try {
    if (-not (Get-Command docker -ErrorAction SilentlyContinue)) { throw 'Docker nao encontrado. Abra o Docker Desktop.' }
    $baseFiles = @()
    $containerId = (Invoke-DockerText -DockerArguments @('compose','ps','--all','-q','backend')).Trim()
    if ($containerId) {
        $containerId = ($containerId -split '\s+')[0]
        $inspection = @(ConvertFrom-Json (Invoke-DockerText -DockerArguments @('inspect',$containerId)))[0]
        $configuredFiles = $inspection.Config.Labels.'com.docker.compose.project.config_files'
        $projectDir = $inspection.Config.Labels.'com.docker.compose.project.working_dir'
        if ($projectDir -and (Test-Path -LiteralPath $projectDir)) {
            if ([IO.Path]::GetFullPath($projectDir).TrimEnd([char[]]@([char]92,[char]47)) -ne [IO.Path]::GetFullPath($root).TrimEnd([char[]]@([char]92,[char]47))) {
                throw 'Execute este arquivo dentro da pasta do projeto vive-ai-photobooth.'
            }
        }
        if ($configuredFiles) { $baseFiles = @($configuredFiles -split ',' | ForEach-Object { $_.Trim() }) }
    }
    if ($baseFiles.Count -eq 0) {
        if ($env:COMPOSE_FILE) {
            $separator = if ($env:COMPOSE_PATH_SEPARATOR) { $env:COMPOSE_PATH_SEPARATOR } else { ';' }
            $baseFiles = @($env:COMPOSE_FILE -split [regex]::Escape($separator))
        } else {
            foreach ($candidate in @('compose.yaml','compose.yml','docker-compose.yaml','docker-compose.yml')) {
                $file = Join-Path $root $candidate
                if (Test-Path -LiteralPath $file) { $baseFiles = @($file); break }
            }
            foreach ($candidate in @('compose.override.yaml','compose.override.yml','docker-compose.override.yaml','docker-compose.override.yml')) {
                $file = Join-Path $root $candidate
                if (Test-Path -LiteralPath $file) { $baseFiles += $file; break }
            }
        }
    }
    $baseFiles = @($baseFiles | ForEach-Object { [IO.Path]::GetFullPath($_) } | Where-Object { $_ -ne $overlayPath } | Select-Object -Unique)
    if ($baseFiles.Count -eq 0) { throw 'Arquivo Compose nao encontrado. Execute na raiz do projeto.' }
    foreach ($file in $baseFiles) { if (-not (Test-Path -LiteralPath $file)) { throw 'Um arquivo Compose do projeto nao foi encontrado.' } }
    $composeArguments = @('compose')
    foreach ($file in $baseFiles) { $composeArguments += @('-f',$file) }
    $serviceText = Invoke-DockerText -DockerArguments ($composeArguments + @('config','--services'))
    $services = @($serviceText -split '\s+')
    if (('backend' -notin $services) -or ('celery' -notin $services)) { throw 'O Compose precisa conter os servicos backend e celery.' }

    if (-not $ReutilizarChave) {
        Write-Host 'Cole a chave completa da fal.ai. Ela nao aparecera ao digitar.'
        $secureKey = Read-Host 'Chave fal.ai' -AsSecureString
        $pointer = [Runtime.InteropServices.Marshal]::SecureStringToBSTR($secureKey)
        try { $falKey = [Runtime.InteropServices.Marshal]::PtrToStringBSTR($pointer).Trim() }
        finally { [Runtime.InteropServices.Marshal]::ZeroFreeBSTR($pointer) }
        if (-not $falKey -or $falKey -match '\s') { throw 'A chave esta vazia ou contem espacos. Execute novamente e cole somente a chave.' }
        $environment = @{ AI_PROVIDER = 'fal'; FAL_KEY = $falKey.Replace('$','$$') }
        $overlay = @{ services = @{ backend = @{ environment = $environment }; celery = @{ environment = $environment } } }
        [IO.File]::WriteAllText($overlayPath, ($overlay | ConvertTo-Json -Depth 8), $utf8)
        $hash = [Security.Cryptography.SHA256]::Create()
        try { $expectedFingerprint = [BitConverter]::ToString($hash.ComputeHash([Text.Encoding]::UTF8.GetBytes($falKey))).Replace('-','').ToLowerInvariant() }
        finally { $hash.Dispose(); $falKey = $null; $environment = $null; $overlay = $null; $secureKey.Dispose() }
    } elseif (-not (Test-Path -LiteralPath $overlayPath)) {
        throw 'Nao existe chave salva. Execute novamente sem -ReutilizarChave.'
    }

    # O arquivo local contem a credencial, como um arquivo de ambiente comum.
    $ignorePath = Join-Path $root '.gitignore'
    $ignore = if (Test-Path -LiteralPath $ignorePath) { [IO.File]::ReadAllText($ignorePath) } else { '' }
    foreach ($entry in @('/.vive-fal.override.json','/.env.antes-fal.bak','/.env')) {
        if (($ignore -split '\r?\n') -notcontains $entry) { $ignore = $ignore.TrimEnd() + "`r`n" + $entry + "`r`n" }
    }
    [IO.File]::WriteAllText($ignorePath,$ignore,$utf8)
    $originalEnv = if (Test-Path -LiteralPath $envPath) { [IO.File]::ReadAllText($envPath) } else { '' }
    if ((Test-Path -LiteralPath $envPath) -and -not (Test-Path -LiteralPath $backupPath)) { [IO.File]::WriteAllText($backupPath,$originalEnv,$utf8) }
    $allFiles = @($baseFiles) + @($overlayPath)
    $fileValue = (($allFiles | ForEach-Object { $_.Replace([char]92,[char]47) }) -join ';')
    $updated = Set-DotEnvValue -Content $originalEnv -Name 'COMPOSE_PATH_SEPARATOR' -Value ';'
    $updated = Set-DotEnvValue -Content $updated -Name 'COMPOSE_FILE' -Value $fileValue
    [IO.File]::WriteAllText($envPath,$updated,$utf8)
    $env:COMPOSE_FILE = $fileValue
    $env:COMPOSE_PATH_SEPARATOR = ';'
    $composeArguments += @('-f',$overlayPath)
    Write-Host 'Aplicando fal.ai e reiniciando backend e Celery...'
    & docker @composeArguments up -d --force-recreate backend celery
    if ($LASTEXITCODE -ne 0) { throw 'Falha ao recriar os servicos. A configuracao foi salva; envie a mensagem do Docker.' }
    $probe = 'import hashlib,json; from app.config import settings; print(json.dumps(dict(provider=settings.AI_PROVIDER, configured=bool(settings.FAL_KEY), fingerprint=hashlib.sha256(settings.FAL_KEY.encode()).hexdigest())))'
    foreach ($service in @('backend','celery')) {
        $ready = $false
        for ($attempt = 0; $attempt -lt 6; $attempt++) {
            try {
                $raw = Invoke-DockerText -DockerArguments ($composeArguments + @('exec','-T',$service,'python','-c',$probe))
                $state = ConvertFrom-Json (($raw -split "`n")[-1])
                if ($state.provider -ne 'fal' -or -not $state.configured) { throw 'Configuracao nao carregada.' }
                if (-not $ReutilizarChave -and $state.fingerprint -ne $expectedFingerprint) { throw 'A chave carregada difere da chave informada.' }
                $ready = $true; break
            } catch { if ($attempt -eq 5) { throw 'Nao foi possivel confirmar a configuracao dentro do container. Envie docker compose logs --tail=60 backend celery.' }; Start-Sleep -Seconds 2 }
        }
        if ($ready) { Write-Host ($service + ': fal.ai configurada e chave carregada.') }
    }
    Write-Host 'Pronto. Abra http://localhost:5173/, pressione Ctrl+F5 e teste uma foto.'
    Write-Host 'A chave foi carregada; a validade na fal.ai sera confirmada pela tentativa de geracao.'
} catch {
    Write-Host ('Nao foi possivel concluir: ' + $_.Exception.Message) -ForegroundColor Red
    exit 1
}
