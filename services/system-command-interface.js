import readline from 'readline';

export class SystemCommandInterface {
  constructor(orchestrator, options = {}) {
    this.orchestrator = orchestrator;
    this.options = options;
    this.commands = new Map();
    this.registerBuiltins();
  }

  register(name, description, handler) {
    const key = name.toLowerCase();
    this.commands.set(key, { name: key, description, handler });
    return this;
  }

  registerBuiltins() {
    this.register('help', 'Show available commands', async () => ({
      message: this.buildHelpText(),
    }));

    this.register('status', 'Show overall system status', async () => {
      const status = this.orchestrator.getStatus();
      return {
        message: this.formatStatus(status),
        data: status,
      };
    });

    this.register('services', 'List all services and their state', async () => {
      const services = this.orchestrator.listServices();
      return {
        message: this.formatServices(services),
        data: services,
      };
    });

    this.register('restart', 'Restart a service: /restart <serviceId>', async (args = []) => {
      const [serviceId] = args;
      if (!serviceId) {
        throw new Error('Service id required');
      }
      await this.orchestrator.restartService(serviceId);
      return { message: `Restarted ${serviceId}` };
    });

    this.register('stop', 'Stop a service: /stop <serviceId>', async (args = []) => {
      const [serviceId] = args;
      if (!serviceId) {
        throw new Error('Service id required');
      }
      const stopped = await this.orchestrator.stopService(serviceId);
      return { message: stopped ? `Stopped ${serviceId}` : `${serviceId} already stopped` };
    });

    this.register('start', 'Start a service: /start <serviceId>', async (args = []) => {
      const [serviceId] = args;
      if (!serviceId) {
        throw new Error('Service id required');
      }
      const started = await this.orchestrator.startServiceById(serviceId);
      return { message: started ? `Started ${serviceId}` : `${serviceId} already running` };
    });

    this.register('logs', 'Show recent logs: /logs <serviceId> [lines]', async (args = []) => {
      const [serviceId, countArg] = args;
      if (!serviceId) {
        throw new Error('Service id required');
      }
      const limit = countArg ? Number.parseInt(countArg, 10) : 20;
      const logs = this.orchestrator.getServiceLogs(serviceId, Number.isNaN(limit) ? 20 : limit);
      return {
        message: this.formatLogs(serviceId, logs),
        data: logs,
      };
    });

    this.register('health', 'Run health checks immediately', async () => {
      await this.orchestrator.checkAllHealth();
      return { message: 'Health checks triggered' };
    });

    this.register('enable', 'Enable a service: /enable <serviceId>', async (args = []) => {
      const [serviceId] = args;
      if (!serviceId) {
        throw new Error('Service id required');
      }
      this.orchestrator.setServiceEnabled(serviceId, true);
      return { message: `Enabled ${serviceId}` };
    });

    this.register('disable', 'Disable a service: /disable <serviceId>', async (args = []) => {
      const [serviceId, ...reasonParts] = args;
      if (!serviceId) {
        throw new Error('Service id required');
      }
      const reason = reasonParts.join(' ').trim() || 'Disabled via command interface';
      await this.orchestrator.stopService(serviceId, { force: true });
      this.orchestrator.setServiceEnabled(serviceId, false, reason);
      return { message: `Disabled ${serviceId}` };
    });
  }

  listCommands() {
    return Array.from(this.commands.values())
      .sort((a, b) => a.name.localeCompare(b.name))
      .map(entry => ({ name: entry.name, description: entry.description }));
  }

  async execute(rawInput, context = {}) {
    const input = (rawInput || '').trim();
    if (!input) {
      return { ok: true, message: '', command: null };
    }

    const normalized = input.startsWith('/') ? input.slice(1) : input;
    const [commandName, ...args] = normalized.split(/\s+/);
    const entry = this.commands.get(commandName.toLowerCase());

    if (!entry) {
      return {
        ok: false,
        message: `Unknown command "${commandName}". Type /help.`,
        command: commandName,
      };
    }

    try {
      const result = await entry.handler(args, { ...context, rawInput });
      if (result && typeof result === 'object') {
        return { ok: true, command: commandName, ...result };
      }
      return { ok: true, command: commandName, message: result ?? '' };
    } catch (error) {
      return {
        ok: false,
        command: commandName,
        message: error.message || String(error),
        error,
      };
    }
  }

  buildHelpText() {
    const rows = this.listCommands().map(cmd => `/${cmd.name.padEnd(10)} ${cmd.description}`);
    return ['Available commands:', ...rows].join('\n');
  }

  formatStatus(status) {
    if (!status) {
      return 'No status available';
    }
    const lines = ['System status:'];
    lines.push(`  Running: ${status.isRunning}`);
    for (const [serviceId, info] of Object.entries(status.services)) {
      const icon = info.healthy ? '✅' : info.running ? '⚠️' : '❌';
      const uptime = info.uptime ? `${Math.round(info.uptime / 1000)}s` : 'N/A';
      const enabled = info.enabled ? '' : ' (disabled)';
      const source = info.external ? 'attached' : info.running ? 'managed' : 'stopped';
      lines.push(
        `  ${icon} ${serviceId.padEnd(10)} ${info.name} - ${source}${enabled} (uptime: ${uptime})`
      );
    }
    return lines.join('\n');
  }

  formatServices(services = []) {
    if (!services.length) {
      return 'No services defined';
    }
    const lines = services.map(service => {
      const icon = service.healthy ? '✅' : service.running ? '⚠️' : '❌';
      const enabled = service.enabled
        ? 'enabled'
        : `disabled (${service.disableReason || 'manual'})`;
      const source = service.external ? 'attached external' : 'managed';
      return `${icon} ${service.id.padEnd(10)} ${service.name} - ${source}, ${enabled}`;
    });
    return lines.join('\n');
  }

  formatLogs(serviceId, logs = []) {
    if (!logs.length) {
      return `No logs for ${serviceId}`;
    }
    const header = `Logs for ${serviceId} (latest ${logs.length} entries):`;
    const rows = logs.map(entry => {
      const time = new Date(entry.timestamp).toISOString();
      return `[${time}] ${entry.stream.toUpperCase()}: ${entry.line}`;
    });
    return [header, ...rows].join('\n');
  }
}

export function createReadlineConsole(commandInterface, { prompt = 'lightdom> ' } = {}) {
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  const showPrompt = () => rl.prompt();
  rl.setPrompt(prompt);

  rl.on('line', async line => {
    const result = await commandInterface.execute(line, { source: 'console' });
    if (result.message) {
      if (result.ok) {
        console.log(result.message);
      } else {
        console.error(result.message);
      }
    }
    showPrompt();
  });

  rl.on('close', () => {
    console.log('Console closed');
  });

  showPrompt();
  return rl;
}

export default SystemCommandInterface;
