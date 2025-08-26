/**
 * Advanced Debug Logging System
 * Provides detailed logging for AI calls, server requests, and function stack traces
 */

export interface LogEntry {
  timestamp: Date;
  level: 'ai' | 'server' | 'stack' | 'info' | 'warn' | 'error';
  category: string;
  message: string;
  data?: any;
  stackTrace?: string;
}

export class DebugLogger {
  private static instance: DebugLogger;
  private logs: LogEntry[] = [];
  private maxLogs = 1000;
  private aiLoggingEnabled = false;
  private detailedLoggingEnabled = false;
  private logPanel: HTMLElement | null = null;

  private constructor() {
    this.setupLogPanel();
  }

  public static getInstance(): DebugLogger {
    if (!DebugLogger.instance) {
      DebugLogger.instance = new DebugLogger();
    }
    return DebugLogger.instance;
  }

  public enableAILogging(enabled: boolean): void {
    this.aiLoggingEnabled = enabled;
    this.updatePanelVisibility();
    this.logInfo('Debug', `AI logging ${enabled ? 'enabled' : 'disabled'}`);
  }

  public enableDetailedLogging(enabled: boolean): void {
    this.detailedLoggingEnabled = enabled;
    this.updatePanelVisibility();
    this.logInfo('Debug', `Detailed logging ${enabled ? 'enabled' : 'disabled'}`);
  }

  public isAILoggingEnabled(): boolean {
    return this.aiLoggingEnabled;
  }

  public isDetailedLoggingEnabled(): boolean {
    return this.detailedLoggingEnabled;
  }

  private setupLogPanel(): void {
    // Create floating log panel
    this.logPanel = document.createElement('div');
    this.logPanel.id = 'debug-log-panel';
    this.logPanel.style.cssText = `
      position: fixed;
      bottom: 20px;
      right: 20px;
      width: 400px;
      height: 300px;
      background: rgba(10, 10, 10, 0.95);
      border: 2px solid #8b5cf6;
      border-radius: 8px;
      color: #00ff00;
      font-family: 'Courier New', monospace;
      font-size: 11px;
      overflow: hidden;
      z-index: 2100;
      display: none;
      backdrop-filter: blur(4px);
      box-shadow: 0 8px 32px rgba(139, 92, 246, 0.3);
    `;

    // Create header
    const header = document.createElement('div');
    header.style.cssText = `
      background: linear-gradient(135deg, #8b5cf6, #a855f7);
      color: white;
      padding: 8px 12px;
      font-weight: bold;
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-radius: 6px 6px 0 0;
      font-size: 12px;
    `;
    header.innerHTML = `
      <span>🔍 Debug Logger</span>
      <div>
        <button id="clear-logs" style="background: none; border: 1px solid white; color: white; padding: 2px 6px; border-radius: 3px; cursor: pointer; font-size: 10px; margin-right: 4px;">Clear</button>
        <button id="close-logs" style="background: none; border: 1px solid white; color: white; padding: 2px 6px; border-radius: 3px; cursor: pointer; font-size: 10px;">✕</button>
      </div>
    `;

    // Create log content area
    const logContent = document.createElement('div');
    logContent.id = 'debug-log-content';
    logContent.style.cssText = `
      height: calc(100% - 36px);
      overflow-y: auto;
      padding: 8px;
      white-space: pre-wrap;
      font-size: 11px;
      line-height: 1.3;
    `;

    this.logPanel.appendChild(header);
    this.logPanel.appendChild(logContent);

    // Add event listeners
    header.querySelector('#clear-logs')?.addEventListener('click', () => this.clearLogs());
    header.querySelector('#close-logs')?.addEventListener('click', () => this.hidePanel());

    document.body.appendChild(this.logPanel);
  }

  private updatePanelVisibility(): void {
    if (!this.logPanel) return;
    
    const shouldShow = this.aiLoggingEnabled || this.detailedLoggingEnabled;
    this.logPanel.style.display = shouldShow ? 'block' : 'none';
  }

  private addLog(entry: LogEntry): void {
    this.logs.push(entry);
    
    // Keep logs within limit
    if (this.logs.length > this.maxLogs) {
      this.logs = this.logs.slice(-this.maxLogs);
    }

    // Update panel if visible
    this.updateLogDisplay();
  }

  private updateLogDisplay(): void {
    if (!this.logPanel) return;
    
    const content = this.logPanel.querySelector('#debug-log-content');
    if (!content) return;

    const visibleLogs = this.logs.filter(log => {
      if (log.level === 'ai') return this.aiLoggingEnabled;
      if (log.level === 'server' || log.level === 'stack') return this.detailedLoggingEnabled;
      return this.aiLoggingEnabled || this.detailedLoggingEnabled; // Info, warn, error always show if any logging is enabled
    });

    content.innerHTML = visibleLogs.map(log => this.formatLogEntry(log)).join('\n');
    content.scrollTop = content.scrollHeight; // Auto-scroll to bottom
  }

  private formatLogEntry(log: LogEntry): string {
    const timestamp = log.timestamp.toLocaleTimeString();
    const levelColor = this.getLevelColor(log.level);
    const prefix = this.getLevelPrefix(log.level);
    
    let output = `<span style="color: #666;">[${timestamp}]</span> <span style="color: ${levelColor};">${prefix}</span> <span style="color: #ccc;">[${log.category}]</span> ${log.message}`;
    
    if (log.data && typeof log.data === 'object') {
      output += `\n<span style="color: #888;">  Data: ${JSON.stringify(log.data, null, 2)}</span>`;
    } else if (log.data) {
      output += `\n<span style="color: #888;">  Data: ${log.data}</span>`;
    }
    
    if (log.stackTrace && this.detailedLoggingEnabled) {
      output += `\n<span style="color: #666;">  Stack: ${log.stackTrace}</span>`;
    }
    
    return output;
  }

  private getLevelColor(level: string): string {
    switch (level) {
      case 'ai': return '#00ff00';
      case 'server': return '#00bfff';
      case 'stack': return '#ffaa00';
      case 'info': return '#ffffff';
      case 'warn': return '#ffff00';
      case 'error': return '#ff0000';
      default: return '#ccc';
    }
  }

  private getLevelPrefix(level: string): string {
    switch (level) {
      case 'ai': return '🤖';
      case 'server': return '🌐';
      case 'stack': return '📋';
      case 'info': return 'ℹ️';
      case 'warn': return '⚠️';
      case 'error': return '❌';
      default: return '📝';
    }
  }

  private getStackTrace(): string {
    if (!this.detailedLoggingEnabled) return '';
    
    try {
      throw new Error();
    } catch (e) {
      const stack = (e as Error).stack || '';
      // Remove the first few lines which are this function
      return stack.split('\n').slice(3, 8).join('\n');
    }
  }

  // Public logging methods
  public logAI(category: string, message: string, data?: any): void {
    if (!this.aiLoggingEnabled) return;
    
    this.addLog({
      timestamp: new Date(),
      level: 'ai',
      category,
      message,
      data,
      stackTrace: this.detailedLoggingEnabled ? this.getStackTrace() : undefined
    });
  }

  public logServer(category: string, message: string, data?: any): void {
    if (!this.detailedLoggingEnabled) return;
    
    this.addLog({
      timestamp: new Date(),
      level: 'server',
      category,
      message,
      data,
      stackTrace: this.getStackTrace()
    });
  }

  public logStack(category: string, message: string, data?: any): void {
    if (!this.detailedLoggingEnabled) return;
    
    this.addLog({
      timestamp: new Date(),
      level: 'stack',
      category,
      message,
      data,
      stackTrace: this.getStackTrace()
    });
  }

  public logInfo(category: string, message: string, data?: any): void {
    this.addLog({
      timestamp: new Date(),
      level: 'info',
      category,
      message,
      data
    });
  }

  public logWarn(category: string, message: string, data?: any): void {
    this.addLog({
      timestamp: new Date(),
      level: 'warn',
      category,
      message,
      data
    });
  }

  public logError(category: string, message: string, data?: any): void {
    this.addLog({
      timestamp: new Date(),
      level: 'error',
      category,
      message,
      data,
      stackTrace: this.getStackTrace()
    });
  }

  // Specialized diagnostic entries for AI parsing and action outcomes
  public logParserDiagnostics(source: string, heuristic: string, rawSample?: string, parsed?: any): void {
    if (!this.aiLoggingEnabled) return;
  const data: any = { heuristic, parsedPreview: parsed ? JSON.stringify(parsed).slice(0, 200) : null };
  if (rawSample) data.rawSample = rawSample.slice(0, 200);
    this.addLog({
      timestamp: new Date(),
      level: 'ai',
      category: `${source}::parser`,
      message: `Parser heuristic: ${heuristic}`,
      data,
      stackTrace: this.detailedLoggingEnabled ? this.getStackTrace() : undefined
    });
  }

  public logActionResult(pawnId: string, actionType: string, success: boolean, details?: any): void {
    if (!this.aiLoggingEnabled) return;
    this.addLog({
      timestamp: new Date(),
      level: 'ai',
      category: `Action::${pawnId}`,
      message: `${actionType} ${success ? 'succeeded' : 'failed'}`,
      data: details
    });
  }

  public clearLogs(): void {
    this.logs = [];
    this.updateLogDisplay();
  }

  public hidePanel(): void {
    if (this.logPanel) {
      this.logPanel.style.display = 'none';
    }
  }

  public showPanel(): void {
    if (this.logPanel) {
      this.logPanel.style.display = 'block';
    }
  }

  public exportLogs(): string {
    return JSON.stringify(this.logs, null, 2);
  }
}

// Global instance
export const debugLogger = DebugLogger.getInstance();

// Make available globally for console access
(window as any).debugLogger = debugLogger;
