import * as si from 'systeminformation';
import { EventEmitter } from 'events';

export interface SystemInfo {
  system: {
    manufacturer: string;
    model: string;
    version: string;
    serial: string;
    uuid: string;
  };
  cpu: {
    manufacturer: string;
    brand: string;
    family: string;
    model: string;
    stepping: string;
    revision: string;
    voltage: string;
    speed: number;
    speedMin: number;
    speedMax: number;
    cores: number;
    physicalCores: number;
    processors: number;
    socket: string;
    cache: {
      l1d: number;
      l1i: number;
      l2: number;
      l3: number;
    };
  };
  memory: {
    total: number;
    free: number;
    used: number;
    active: number;
    available: number;
    swapTotal: number;
    swapUsed: number;
    swapFree: number;
  };
  os: {
    platform: string;
    distro: string;
    release: string;
    codename: string;
    kernel: string;
    arch: string;
    hostname: string;
    fqdn: string;
    codepage: string;
    logofile: string;
    serial: string;
    build: string;
    servicepack: string;
    uefi: boolean;
  };
  graphics: Array<{
    vendor: string;
    model: string;
    bus: string;
    vram: number;
    vramDynamic: boolean;
  }>;
  disks: Array<{
    device: string;
    type: string;
    name: string;
    vendor: string;
    size: number;
    bytesPerSector: number;
    totalCylinders: number;
    totalHeads: number;
    totalSectors: number;
    totalTracks: number;
    tracksPerCylinder: number;
    sectorsPerTrack: number;
    firmwareRevision: string;
    serialNum: string;
    interfaceType: string;
    smartStatus: string;
    temperature: number;
  }>;
}

export interface ResourceUsage {
  cpu: {
    usage: number;
    usageByCore: number[];
    temperature: number[];
    speed: number[];
    loadAverage: number[];
  };
  memory: {
    total: number;
    free: number;
    used: number;
    active: number;
    available: number;
    buffers: number;
    cached: number;
    slab: number;
    swapTotal: number;
    swapUsed: number;
    swapFree: number;
    usage: number;
  };
  disk: {
    reads: number;
    writes: number;
    readBytes: number;
    writeBytes: number;
    totalBytes: number;
    usage: Array<{
      device: string;
      mount: string;
      total: number;
      used: number;
      available: number;
      usage: number;
    }>;
  };
  network: {
    interfaces: Array<{
      iface: string;
      rx_bytes: number;
      tx_bytes: number;
      rx_sec: number;
      tx_sec: number;
      ms: number;
    }>;
  };
  processes: {
    all: number;
    running: number;
    blocked: number;
    sleeping: number;
    unknown: number;
    list: Array<{
      pid: number;
      parentPid: number;
      name: string;
      cpu: number;
      cpuu: number;
      cpus: number;
      mem: number;
      priority: number;
      memVsz: number;
      memRss: number;
      nice: number;
      started: string;
      state: string;
      tty: string;
      user: string;
      command: string;
      params: string;
    }>;
  };
}

export interface AlertThresholds {
  cpu: number;
  memory: number;
  disk: number;
  temperature: number;
}

export class SystemMonitor extends EventEmitter {
  private isMonitoring = false;
  private monitoringInterval: NodeJS.Timeout | null = null;
  private alertThresholds: AlertThresholds = {
    cpu: 90,
    memory: 90,
    disk: 90,
    temperature: 80,
  };
  private updateInterval = 5000; // 5 seconds

  constructor() {
    super();
  }

  /**
   * Start system monitoring
   */
  start(interval: number = 5000): void {
    if (this.isMonitoring) {
      return;
    }

    this.updateInterval = interval;
    this.isMonitoring = true;

    this.monitoringInterval = setInterval(async () => {
      try {
        const usage = await this.getResourceUsage();
        this.emit('usage-update', usage);
        this.checkAlerts(usage);
      } catch (error) {
        this.emit('error', error);
      }
    }, this.updateInterval);

    this.emit('monitoring-started', { interval: this.updateInterval });
  }

  /**
   * Stop system monitoring
   */
  stop(): void {
    if (!this.isMonitoring) {
      return;
    }

    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
      this.monitoringInterval = null;
    }

    this.isMonitoring = false;
    this.emit('monitoring-stopped');
  }

  /**
   * Get comprehensive system information
   */
  async getSystemInfo(): Promise<SystemInfo> {
    try {
      const [
        system,
        cpu,
        memory,
        osInfo,
        graphics,
        diskLayout,
      ] = await Promise.all([
        si.system(),
        si.cpu(),
        si.mem(),
        si.osInfo(),
        si.graphics(),
        si.diskLayout(),
      ]);

      return {
        system: {
          manufacturer: system.manufacturer,
          model: system.model,
          version: system.version,
          serial: system.serial,
          uuid: system.uuid,
        },
        cpu: {
          manufacturer: cpu.manufacturer,
          brand: cpu.brand,
          family: cpu.family,
          model: cpu.model,
          stepping: cpu.stepping,
          revision: cpu.revision,
          voltage: cpu.voltage,
          speed: cpu.speed,
          speedMin: cpu.speedmin,
          speedMax: cpu.speedmax,
          cores: cpu.cores,
          physicalCores: cpu.physicalCores,
          processors: cpu.processors,
          socket: cpu.socket,
          cache: {
            l1d: cpu.cache.l1d,
            l1i: cpu.cache.l1i,
            l2: cpu.cache.l2,
            l3: cpu.cache.l3,
          },
        },
        memory: {
          total: memory.total,
          free: memory.free,
          used: memory.used,
          active: memory.active,
          available: memory.available,
          swapTotal: memory.swaptotal,
          swapUsed: memory.swapused,
          swapFree: memory.swapfree,
        },
        os: {
          platform: osInfo.platform,
          distro: osInfo.distro,
          release: osInfo.release,
          codename: osInfo.codename,
          kernel: osInfo.kernel,
          arch: osInfo.arch,
          hostname: osInfo.hostname,
          fqdn: osInfo.fqdn,
          codepage: osInfo.codepage,
          logofile: osInfo.logofile,
          serial: osInfo.serial,
          build: osInfo.build,
          servicepack: osInfo.servicepack,
          uefi: osInfo.uefi,
        },
        graphics: graphics.controllers.map(gpu => ({
          vendor: gpu.vendor,
          model: gpu.model,
          bus: gpu.bus,
          vram: gpu.vram,
          vramDynamic: gpu.vramDynamic,
        })),
        disks: diskLayout.map(disk => ({
          device: disk.device,
          type: disk.type,
          name: disk.name,
          vendor: disk.vendor,
          size: disk.size,
          bytesPerSector: disk.bytesPerSector,
          totalCylinders: disk.totalCylinders,
          totalHeads: disk.totalHeads,
          totalSectors: disk.totalSectors,
          totalTracks: disk.totalTracks,
          tracksPerCylinder: disk.tracksPerCylinder,
          sectorsPerTrack: disk.sectorsPerTrack,
          firmwareRevision: disk.firmwareRevision,
          serialNum: disk.serialNum,
          interfaceType: disk.interfaceType,
          smartStatus: disk.smartStatus,
          temperature: disk.temperature,
        })),
      };
    } catch (error) {
      throw new Error(`Failed to get system info: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get current resource usage
   */
  async getResourceUsage(): Promise<ResourceUsage> {
    try {
      const [
        currentLoad,
        memory,
        disksIO,
        fsSize,
        networkStats,
        processes,
        cpuTemperature,
      ] = await Promise.all([
        si.currentLoad(),
        si.mem(),
        si.disksIO(),
        si.fsSize(),
        si.networkStats(),
        si.processes(),
        si.cpuTemperature(),
      ]);

      return {
        cpu: {
          usage: currentLoad.currentload,
          usageByCore: currentLoad.cpus.map(cpu => cpu.load),
          temperature: cpuTemperature.cores.map(core => core.temperature),
          speed: currentLoad.cpus.map(cpu => cpu.speed),
          loadAverage: currentLoad.avgload ? [currentLoad.avgload] : [],
        },
        memory: {
          total: memory.total,
          free: memory.free,
          used: memory.used,
          active: memory.active,
          available: memory.available,
          buffers: memory.buffers,
          cached: memory.cached,
          slab: memory.slab,
          swapTotal: memory.swaptotal,
          swapUsed: memory.swapused,
          swapFree: memory.swapfree,
          usage: (memory.used / memory.total) * 100,
        },
        disk: {
          reads: disksIO.rIO,
          writes: disksIO.wIO,
          readBytes: disksIO.rIO_sec,
          writeBytes: disksIO.wIO_sec,
          totalBytes: disksIO.tIO_sec,
          usage: fsSize.map(fs => ({
            device: fs.fs,
            mount: fs.mount,
            total: fs.size,
            used: fs.used,
            available: fs.available,
            usage: fs.use,
          })),
        },
        network: {
          interfaces: networkStats.map(iface => ({
            iface: iface.iface,
            rx_bytes: iface.rx_bytes,
            tx_bytes: iface.tx_bytes,
            rx_sec: iface.rx_sec,
            tx_sec: iface.tx_sec,
            ms: iface.ms,
          })),
        },
        processes: {
          all: processes.all,
          running: processes.running,
          blocked: processes.blocked,
          sleeping: processes.sleeping,
          unknown: processes.unknown,
          list: processes.list.slice(0, 20).map(proc => ({
            pid: proc.pid,
            parentPid: proc.parentPid,
            name: proc.name,
            cpu: proc.cpu,
            cpuu: proc.cpuu,
            cpus: proc.cpus,
            mem: proc.mem,
            priority: proc.priority,
            memVsz: proc.memVsz,
            memRss: proc.memRss,
            nice: proc.nice,
            started: proc.started,
            state: proc.state,
            tty: proc.tty,
            user: proc.user,
            command: proc.command,
            params: proc.params,
          })),
        },
      };
    } catch (error) {
      throw new Error(`Failed to get resource usage: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get specific process information
   */
  async getProcessInfo(pid: number): Promise<any> {
    try {
      const processes = await si.processes();
      const process = processes.list.find(proc => proc.pid === pid);
      
      if (!process) {
        throw new Error(`Process with PID ${pid} not found`);
      }

      return {
        ...process,
        children: processes.list.filter(proc => proc.parentPid === pid),
      };
    } catch (error) {
      throw new Error(`Failed to get process info: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get network interface information
   */
  async getNetworkInfo(): Promise<any> {
    try {
      const [networkInterfaces, networkConnections, networkGateway] = await Promise.all([
        si.networkInterfaces(),
        si.networkConnections(),
        si.networkGatewayDefault(),
      ]);

      return {
        interfaces: networkInterfaces,
        connections: networkConnections,
        gateway: networkGateway,
      };
    } catch (error) {
      throw new Error(`Failed to get network info: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get battery information (for laptops)
   */
  async getBatteryInfo(): Promise<any> {
    try {
      const battery = await si.battery();
      return battery;
    } catch (error) {
      throw new Error(`Failed to get battery info: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get USB device information
   */
  async getUsbInfo(): Promise<any> {
    try {
      const usb = await si.usb();
      return usb;
    } catch (error) {
      throw new Error(`Failed to get USB info: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Set alert thresholds
   */
  setAlertThresholds(thresholds: Partial<AlertThresholds>): void {
    this.alertThresholds = { ...this.alertThresholds, ...thresholds };
    this.emit('thresholds-updated', this.alertThresholds);
  }

  /**
   * Get current alert thresholds
   */
  getAlertThresholds(): AlertThresholds {
    return { ...this.alertThresholds };
  }

  /**
   * Check for alerts based on current usage
   */
  private checkAlerts(usage: ResourceUsage): void {
    const alerts: Array<{ type: string; level: 'warning' | 'critical'; message: string; value: number }> = [];

    // CPU usage alert
    if (usage.cpu.usage > this.alertThresholds.cpu) {
      alerts.push({
        type: 'cpu',
        level: usage.cpu.usage > 95 ? 'critical' : 'warning',
        message: `High CPU usage: ${usage.cpu.usage.toFixed(1)}%`,
        value: usage.cpu.usage,
      });
    }

    // Memory usage alert
    if (usage.memory.usage > this.alertThresholds.memory) {
      alerts.push({
        type: 'memory',
        level: usage.memory.usage > 95 ? 'critical' : 'warning',
        message: `High memory usage: ${usage.memory.usage.toFixed(1)}%`,
        value: usage.memory.usage,
      });
    }

    // Disk usage alerts
    for (const disk of usage.disk.usage) {
      if (disk.usage > this.alertThresholds.disk) {
        alerts.push({
          type: 'disk',
          level: disk.usage > 95 ? 'critical' : 'warning',
          message: `High disk usage on ${disk.mount}: ${disk.usage.toFixed(1)}%`,
          value: disk.usage,
        });
      }
    }

    // Temperature alerts
    const maxTemp = Math.max(...usage.cpu.temperature.filter(temp => temp > 0));
    if (maxTemp > this.alertThresholds.temperature) {
      alerts.push({
        type: 'temperature',
        level: maxTemp > 90 ? 'critical' : 'warning',
        message: `High CPU temperature: ${maxTemp}°C`,
        value: maxTemp,
      });
    }

    if (alerts.length > 0) {
      this.emit('alerts', alerts);
    }
  }

  /**
   * Get monitoring status
   */
  getMonitoringStatus(): { isMonitoring: boolean; interval: number } {
    return {
      isMonitoring: this.isMonitoring,
      interval: this.updateInterval,
    };
  }

  /**
   * Cleanup resources
   */
  cleanup(): void {
    this.stop();
    this.removeAllListeners();
  }
} 