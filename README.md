(08/12/2021) Forked from the excellently written [bossley9's Arch install instructions](https://github.com/bossley9/Dotfiles/tree/arch) with my own modifications and additions.

Meant as a companion guide to the [official Arch guide.](https://wiki.archlinux.org/title/Installation_guide) Some things are only covered there, while this gets you up to speed faster.

## Navigation
- [Setup](#setup)
- [Boot Start](#boot-start)
- [Internet](#internet)
- [Update the System Clock](#update-the-system-clock)
- [Disk Partitioning](#disk-partitioning)
- [Operating System Installation](#operating-system-installation)
- [Fstab](#fstab)
- [Chroot](#chroot)
- [Localization](#localization)
- [Network Configuration](#network-configuration)
- [Password](#password)
- [Boot Loader](#boot-loader)
- [Installation Wrapup](#installation-wrapup)
- [Post-Install Internet](#post-install-internet)
- [Creating a User](#creating-a-user)
- [Core](#core)
- [Cloning](#cloning)
- [Custom Install](#custom-install)
- [Drivers](#drivers)
- [Extra Guides](#extras)
- [Problems & Fixes](#problems)
- [Other Resources](#resources)

## Install instructions

## Setup <a name="setup"></a>

- Download the latest [Archlinux image](https://archlinux.org/download) from the website.
  Given the option, I downloaded version `2021.07.01-x86_64`.
  I would highly recommend using checksums to validate the integrity of the image.
- Burn the downloaded disk image onto the usb.
  This can be done using a number of different tools:
  - [Balena Etcher](https://www.balena.io/etcher) (cross-platform)
  - [Rufus](https://rufus.ie) (Windows)
  - [Mkusb](https://help.ubuntu.com/community/mkusb) (Linux/Ubuntu)
  - If you prefer command line like me (where $ denotes elevated privileges):
    ```
    $ dd bs=4M if=/path/to/img of=/dev/sdx status=progress
    ```
- Boot the computer from the live usb.
  This may require manual BIOS tweaking depending on your machine.
  Be sure to boot with UEFI (especially if you plan on dual booting with Windows).

## Boot Start <a name="boot-start"></a>

The boot process should eventually land on a virtual terminal prompt where you can log in with the given credentials.

- Use `loadkeys [layout]` to load a keyboard layout. Mine is `br-abnt2`.
- Verify the boot mode is UEFI via `ls /sys/firmware/efi/efivars`. If nothing is returned the boot mode might not be UEFI.

## Internet <a name="internet"></a>

- You can test for internet with the following command:
  ```
  ping archlinux.org
  ```
  If an internet connection has already been established, you will see an incremental
  output of packets.
  If not, a DNS error will return.
  ```
  ping: archlinux.org: Name or service not known.
  ```
  Type `ctrl+c` to stop the program.
  If an internet connection has been established, you can skip ahead to the next step.
- Assuming no internet connection exists, use `ip link` to retrieve the names of all network cards.
  Remember the names of the cards that display.
  On most machines there are at least three types of network cards:
  - `lo` represents a loopback device, which is similar to a virtual network.
    This is how 127.0.0.1 and other localhost ports are accessed.
  - `eth0` represents an ethernet (wired) network card.
    Usually the interface is given a more specific name, such as `enp34s0`.
  - `wlan0` represents a wireless network card.
    As with ethernet, this usually passes under a specific name like `wlp1s0`.
    In this guide I use wlan0 to represent the wireless card name.
- If you plan on using ethernet, internet should automatically be configured.
  Otherwise, you can connect to a network with iwd:
  - Enter the iwctl prompt.
    ```
    iwctl
    ```
  - Verify the computer's wireless card.
    This should display the wireless card(s) you saw earlier with ip link.
    ```
    device list
    ```
  - Scan for local networks.
    This command does not display any output and instead silently scans.
    ```
    station wlan0 scan
    ```
  - List all scanned networks.
    ```
    station wlan0 get-networks
    ```
  - Connect to an internet network, where SSID is the name of the network.
    This will prompt for a password if required.
    ```
    station wlan0 connect SSID
    ```
  - Type `exit` to return to the original terminal prompt.
  - Verify `ping archlinux.org` produces a response.
    Do not proceed and repeat this section until a response appears.

## Update the System Clock <a name="update-the-system-clock"></a>

- Update the system clock.
  ```
  timedatectl set-ntp true
  ```

## Disk Partitioning <a name="disk-partitioning"></a>

*If using LVM/LUKS [use my other guide.](https://github.com/Vinesma/.dotfiles/blob/master/install/LVM%20%26%20LUKS.md)*

In this guide I assume only one disk and that the full disk is being utilized.
I use `ext4` as my primary filesystem.

- My partition scheme will be as follows:
  ```
  /efi - 200 MB (Doesn't need to be created if an EFI partition already exists)
  [SWAP] - If hybernation is needed, the size of RAM or double. If not, half of RAM should suffice.
  / - 80 GB
  /home - Remainder of space
  ```

- Determine the size of the disk and the size of RAM memory.
  I will be using and referencing `/dev/sda` as my disk.
  ```sh
  fdisk -l
  free -h
  ```
- Use `fdisk /dev/sda` to enter a command-line disk partition editor.
  In this prompt you may type `p` to view the pending partition table.
- Type `g` to create a new GPT partition scheme.
  This will also erase the old partition table along with any old partitions.
- Create an efi partition.
  Create a new partition, use the default partition number and first sector, and size the partition.
  ```
  n
  enter
  enter
  +200M
  ```
  If prompted to remove an existing filesystem signature, say `yes`.
  New signatures will be established for the new partitions.
  If you accidentally create a bad partition, you can always delete the partition using the `d` key.
- Tag the new partition as `EFI System`:
  ```
  t
  1
  ```
- Create a SWAP partition. This never needs to be very big, especially if you never plan on hibernation.
- Tag the SWAP partition as `Linux swap`:
  ```
  t
  2
  19
  ```
- Create a root `/` partition.
  ```
  n
  enter
  enter
  +80G
  ```
- Create a `/home` home partition. This partition will use the remainder of the disk space.
  ```
  n
  enter
  enter
  enter
  ```
- Type `p` to view your partitions.
  Once you are satisfied with your partitioning, type `w` to permanently write the partitioning scheme to the disk.
  You will be returned to the virtual terminal prompt, where you will be able to run `fdisk -l` to view your newly created partitions.
- Change all partition signatures.
  ```
  mkfs.fat -F 32 -n BOOT /dev/sda1
  mkswap -L SWAP /dev/sda2
  swapon /dev/sda2
  mkfs.ext4 -L ROOT /dev/sda3
  mkfs.ext4 -L HOME /dev/sda4
  ```
- Mount the partitions.
  ```
  mount /dev/sda3 /mnt
  mkdir /mnt/efi
  mount /dev/sda1 /mnt/efi
  mkdir /mnt/home
  mount /dev/sda4 /mnt/home
  ```
  You can use the `lsblk -f` command to verify that your partitions have been mounted correctly.

## Operating System Installation <a name="operating-system-installation"></a>

- Install the kernel and operating system base.
  This usually takes some time to complete depending on your internet stability.
  I also recommend installing a text editor.
  Additionally, you may consider `linux-zen` over `linux` on desktops for performance reasons.
  Setting up Reflector can also provide better download speeds.
  ```
  pacstrap /mnt base linux linux-firmware neovim networkmanager man-db man-pages texinfo
  ```

## Fstab <a name="fstab"></a>

- Generate an Fstab file.
  This is a file that dictates how partitions are mounted when the system boots.
  ```
  genfstab -U /mnt >> /mnt/etc/fstab
  ```
  You can double check that `/mnt/etc/fstab` is formatted according to your needs
  and modify any mount options if needed.

## Chroot <a name="chroot"></a>

- Change root into the new system. You will now be within your newly-formatted disk.
  ```
  arch-chroot /mnt
  ```

## Localization <a name="localization"></a>

- Set the time zone, where REGION and CITY pertain to your local area.
  These values can be tab-completed.
  ```
  ln -sf /usr/share/zoneinfo/REGION/CITY /etc/localtime
  ```
- Sync the clock to the time zone specified.
  ```
  hwclock --systohc
  ```
- Edit `/etc/locale.gen` to enable necessary locales.
  ```
  en_US.UTF-8 UTF-8
  pt_BR.UTF-8 UTF-8
  ja_JP.UTF-8 UTF-8
  ```
  Then generate locales.
  ```
  locale-gen
  ```
- Edit `/etc/locale.conf` to set the system language:
  ```
  LANG=en_US.UTF-8
  LC_MESSAGES=en_US.UTF-8
  LC_MONETARY=pt_BR.UTF-8
  LC_PAPER=pt_BR.UTF-8
  LC_MEASUREMENT=pt_BR.UTF-8
  LC_ADDRESS=pt_BR.UTF-8
  LC_TIME=pt_BR.UTF-8
  ```
- Edit `/etc/vconsole.conf` to permanently set the console keyboard layout:
  ```
  KEYMAP=br-abnt2
  ```

## Network Configuration <a name="network-configuration"></a>

- Name your system in `/etc/hostname`. I will name mine `ghost`.
  ```
  ghost
  ```
- Create the corresponding host entries in `/etc/hosts`:
  ```
  127.0.0.1     localhost
  ::1           localhost
  127.0.1.1     ghost.localdomain    ghost
  ```
- Enable network manager.
  ```
  systemctl enable NetworkManager
  ```

## Password <a name="password"></a>

- Set the root password.
  ```
  passwd
  ```

## Boot Loader <a name="boot-loader"></a>

I use Grub as a bootloader because it is simple, quick, and works on both UEFI/BIOS systems. It also has a customizeable appearance. The commands below only work for UEFI systems, if using BIOS please check the wiki.

*If going along with my LVM/LUKS guide, use `/boot` instead of `/efi` in the following commands.*

- Install the bootloader.
  ```
  pacman -S grub efibootmgr
  grub-install --target=x86_64-efi --efi-directory=/efi --bootloader-id=GRUB
  ```
  Generate the configuration file.
  ```
  grub-mkconfig -o /boot/grub/grub.cfg
  ```

## Installation Wrapup <a name="installation-wrapup"></a>

At this point, we have completely installed everything needed for a fully functional system.

- Exit chroot and umount the partitions.
  ```
  exit
  umount -R /mnt
  ```
- Shutdown the system.
  ```
  shutdown now
  ```
  Then remove the usb drive.
- Power on the machine.
  You likely need to change the BIOS settings of your machine in order to tell your motherboard the location of the efi boot partition.

  If it boots into a bootloader menu, then stops at a login prompt, you've just successfully completed a standard Archlinux installation! However, this specific installation is anything but standard - we still have some work to do.

- Log in to root using `root` as the username and the password you created earlier.

## Post-Install Internet <a name="post-install-internet"></a>

- Connect to internet.
- If you use network manager, you can use utilities such as `nmcli` or `nmtui`.
- Verify internet connection with `ping archlinux.org`.

## Creating a User <a name="creating-a-user"></a>

- Create a new user.
  This will be the main user.
  ```
  useradd -m -G video,wheel sam
  passwd sam
  ```
- Install sudo and configure the sudoers file. Uncomment the wheel group permissions line.
  ```
  pacman -Syu --needed sudo
  EDITOR=/usr/bin/nvim visudo
  ```
- Then `logout` and log back in as the newly created user.

## Core <a name="core"></a>

- Enable the multilib repos in `/etc/pacman.conf`:
  ```
  [multilib]
  Include = /etc/pacman.d/mirrorlist
  ```
- Run a system upgrade to update any packages that were not up to date when the system was installed.
  It's a good practice to do this on a clean install even if no packages need updating.
  ```
  sudo pacman -Syu
  ```
- Install git and other core utilities.
  ```
  sudo pacman -S git python
  ```

## Cloning <a name="cloning"></a>

- Clone this repository to your home folder using the steps outlined below.
  ```sh
  cd $HOME
  git clone https://github.com/Vinesma/.dotfiles.git
  ```
- Run the install script I have created:
  ```sh
  cd $HOME/.dotfiles/install
  python main.py
  ```

## Custom install script <a name="custom-install"></a>

- Go to `~/.dotfiles/install`
- Edit `main.json` in the `data` folder. Put the name of the package group you wish to install inside the array, like so:
  ```json
  # 'initial' should always be first
  [
    "initial",
    "wm_qtile",
    "display_manager",
    "term_kitty"
  ]
  ```
- Run `python main.py` and choose `Full install`.
- Leave to get a coffee or stay and watch. If any errors happen the script will show them and then stop for 30 seconds. Make a note of what happened and if it is concerning enough to warrant stopping the installation with ctrl+c.
- To resume the install, remove the already installed groups from `main.json` and choose the `Full install` option again. Alternatively, choose the `Select group` option from the menu to install package groups individually.

## Drivers <a name="drivers"></a>

- [Figure out which drivers you want to install.](https://wiki.archlinux.org/title/Xorg#Driver_installation)
- The `xorg-drivers` group has other video drivers to install. Good for VMs.

Finally, we may `reboot` the machine and make use of Arch Linux!

## Extra guides <a name="extras"></a>

### NeoVim

[Neovim](https://neovim.io/) is my terminal editor of choice.

- Run `:checkhealth` for a overview of what is supported, like python support and others.

Plugins:

1. Install [vim-plug](https://github.com/junegunn/vim-plug/wiki/tutorial#setting-up)

1. Run `:PlugInstall` in nvim to install the plugins already declared inside `init.vim`.

1. To upgrade plugins, run `:PlugUpdate`.

1. Remove plugins by removing their lines in the config file, restarting nvim and then running `:PlugClean`.

VSCode integration:

1. For using neovim inside vscode, you need to install a vscode extension.

1. Run `nvim -v` and check if your version is higher than 0.5.0. If it is ignore the next step and just add the path to your nvim to the extension config. You can run `command -v nvim` to find the path.

1. If the distro repositories don't package nvim 0.5.0+, the easiest way to get it is by [downloading the appimage](https://github.com/neovim/neovim/releases) running: `chmod u+x` on it, then adding the path to it in the extension config. This hasn't really been needed in a while, but I'll keep this part of the guide up for now.

### VirtualBox

[VirtualBox](https://www.virtualbox.org/) runs virtual machines in an easy way.

1. Run the command:
  ```sh
  LC_ALL=C lscpu | grep Virtualization
  ```
  to check if Virtualization is supported. If nothing is shown then Virtualization is **not** supported

1. [Enable virtualization in the BIOS](https://support.bluestacks.com/hc/en-us/articles/115003174386-How-can-I-enable-virtualization-VT-on-my-PC-)

1. [Guide](https://wiki.archlinux.org/title/VirtualBox#Installation_steps_for_Arch_Linux_hosts)

### libvirt + KVM/QEMU + virt-manager

- Check if KVM is enabled:
  ```
  LC_ALL=C lscpu | grep Virtualization
  ```
- Check if the necessary modules are available, they must be set to either `y` or `m`:
  ```
  zgrep CONFIG_KVM /proc/config.gz
  ```
- Verify if the kernel modules are automatically loaded with:
  ```
  lsmod | grep kvm
  ```
  The command should return something. If not, you will need to manually load the modules. Check the wiki.
- Install: `libvirt qemu virt-manager`
- Install: `iptables-nft dnsmasq` for default networking via NAT/DHCP, and no, just `iptables` does not work.
- Install: `edk2-ovmf` for UEFI support, be sure to check `Customize before install` in virt-manager.
- Add yourself to the `libvirt` group:
  ```sh
  sudo gpasswd -a "$USER" libvirt
  ```
- Enable libvirtd:
  ```sh
  systemctl enable --now libvirtd
  ```
- Now you can run and use `virt-manager`, click the + button and follow the instructions to create a VM.
- [More info](https://wiki.archlinux.org/title/Libvirt#Installation)

### Android Studio

Android Studio can be installed from the AUR.

- [Guide](https://wiki.archlinux.org/index.php/Android#Android_Studio)

- [React Native Guide](https://reactnative.dev/docs/environment-setup)

### Flutter

Flutter can be installed from the AUR.

1. Run `flutter doctor` to verify missing dependencies

2. Install the VSCode Flutter extension

3. [Guide](https://flutter.dev/docs/get-started/install)

### SSH

For ssh, we have to identify what machine you want to use as a `client` and which you want to use as a `server`. Most configuration will be done in the `server`.

`server`:

- Install `openssh` (It's probably already installed)

- Enable the server:
  ```sh
  systemctl enable --now sshd
  ```

`client`:

- Create a key pair using `ssh-keygen`

- Copy the newly generated pair to the server using:
  ```sh
  ssh-copy-id -i ~/.ssh/id_rsa.pub $USER@$IP_ADDR

  $USER = The username to login at the server
  $ADDR = The server ip. Can be found by running `ip -br -c address` at the server
  ```

- Connect to the server using:
  ```sh
  ssh $USER@$ADDR
  ```

`server`:

- Configure `/etc/ssh/sshd_config`, important settings to change are `Port`, changing `PermitRootLogin` to `no` and adding `PasswordAuthentication no` to force key based authentication. This can be done remotely. Don't forget to restart the server afterwards using:
  ```sh
  systemctl restart sshd.service
  ```

`client`:

- Configure `~/.ssh/config` using the examples located at `~/.dotfiles/files/ssh_config`. This enables faster connection to the server by simply typing `ssh $HOST` instead of `ssh -p $PORT $USER@IP_ADDR`

Tips:

- The keys can be named however you want for ease of identification. You can also pass the `-t` flag to the `ssh-keygen` command to use different cryptographic algorithms, such as 'ed25519' which is more secure and has a smaller string to pass around.

- A `ssh-agent` user file is included in the install, this will cache ssh passwords so that they only have to be typed once every user session. To use it, enable the service with `systemctl enable --user --now ssh-agent.service` and add your private keys with `ssh-add ~/.ssh/KEY_NAME`. To make all ssh clients store keys in the agent on first use, add the configuration setting `AddKeysToAgent yes` to `~/.ssh/config`.

### TLP

Provides power saving capabilities. More relevant if using a laptop.

To check the status of TLP run: `tlp-stat -s`

[More info](https://linrunner.de/tlp/installation/arch.html)

### Multiple monitors

- Run `xrandr --listmonitors` and grab the identifier for each monitor you wish to set up:

- Example output:
  ```
  Monitors: 2
  0: +\*eDP1 1366/310x768/170+1920+0 eDP1
  1: +HDMI1 1920/520x1080/290+0+0 HDMI1
  ```

- Edit the example file: `X11/10-monitor.conf` accordingly for each monitor you have, then copy the file to `/etc/X11/xorg.conf.d`.

### Anacron

Anacron is included with `cronie`.

Edit the config file in `/etc/anacrontab` to add new jobs.
```sh
# period in days    delay in minutes    job-identifier    command

@weekly    5    test-job    /usr/local/bin/yt-dlp -q 'myfavplaylist'
```

If the jobs don't seem to run, check if `/etc/cron.hourly/0anacron` is preventing jobs when on battery power.

### PulseAudio

PulseAudio uses rather conservative settings by default so it can run fine on most hardware. Changing these defaults may increase audio quality substantially.

- Copy `/etc/pulse/daemon.conf` to `~/.config/pulse/` and use the resources below:
- [A rather extensive guide on configuring PulseAudio](https://forum.level1techs.com/t/improving-linux-audio-updated/134511)
- A small snippet of good options to change:
  ```sh
  # ~/.config/pulse/daemon.conf
  avoid-resampling = yes # might distort audio
  resample-method = speex-float-6 # higher uses more cpu, 7 is transparent, use -fixed instead -float on ancient cards
  flat-volumes = no
  default-sample-format = float32le # based on endianness: $ lscpu | grep 'Byte'
  default-sample-rate = 48000
  alternate-sample-rate = 44100 # windows-computers default
  ```

## Problems & fixes <a name="problems"></a>

### A script run via cron fails to send notifications via notify-send

[Solution: cron has no access to the DBUS address and the DISPLAY variable, they have to be set inside your script or before the notify-send call.](https://wiki.archlinux.org/index.php/Cron#Running_X.org_server-based_applications)

### The clock is wrong

[Solution](https://wiki.archlinux.org/index.php/System_time#Read_clock) (run `timedatectl` to check, can also be used to set time)

Run this to enable clock synchronization:

- `timedatectl set-ntp true`

### I dual boot and Windows' clock is wrong

Windows uses localtime by default. To make it use UTC a registry fix is required. Open `regedit` and add a DWORD value with hexadecimal value `1` to the registry:

`HKEY_LOCAL_MACHINE\SYSTEM\CurrentControlSet\Control\TimeZoneInformation\RealTimeIsUniversal`

[UTC in Windows](https://wiki.archlinux.org/title/System_time#UTC_in_Microsoft_Windows)

### pywal has no support for dunst

Solution: For pywal to work with dunst, copy the template file in `~/.dotfiles/pywal-templates/colors-dunst` to `~/.config/wal/templates/`. Edit the template accordingly and then run `wal` with a path to your desired wallpaper in a terminal. The template will be parsed and spit out at `~/.cache/wal/colors-dunst` which can then be linked to `~/.config/dunst/dunstrc`. You will only need to do this if something goes horribly wrong, since my install scripts should be able to take care of it.

This also applies to anything else unsupported by pywal.

### Laptop only boots or runs when charging, as soon as it gets unplugged the laptop freezes half a second later

Solution: Disabling tlp in `/etc/tlp.conf` by editing the line TLP_ENABLE=1 to TLP_ENABLE=0. Afterwards, edit `/etc/default/cpupower` and set `governor` to "performance". This fixes the problem but leaves the laptop without any power saving capability.

[TLP debugging](https://linrunner.de/tlp/support/troubleshooting.html#step-3-disable-tlp-temporarily)

### Laptop won't shutdown or reboot completely. Screen goes black but external lights stay on and the fan keeps spinning no matter how long I wait

Unsolved: Never found a solution, but reinstalling the system a few months later resolved the issue.

### Wrong resolution upon startup

Solution 1: Do the instructions in "Multiple monitors", they can maybe fix the problem, even if you have only one monitor.

Solution 2: Add `xrandr --output OUTPUT --mode WIDTHxHEIGHT` to the line that starts with `greeter-setup-script` in `/etc/lightdm/lightdm.conf`. You can find the values needed by running `xrandr` with no arguments. In my experience, the resolution is correct about 30% of the time when I boot. The only real solution I've found is to immediately shutdown your WM and login again. This works but is quite annoying.

### Autostart is not working

Solution: Run `chmod +x ~/.autostart`.

### Something else went _kaput_

Solution: I hope you had timeshift configured because it'll be the thing to save you. Find a pen drive with a liveCD to boot with, install timeshift on the live environment and let it restore from your timeshift snapshot directory (usually `/run/timeshift/backup/timeshift/snapshots/`).

## Links/Resources <a name="resources"></a>

Things that had their own section and were moved or removed, along with other resources that don't fit anywhere else:

- [Touchpad](https://wiki.archlinux.org/index.php/Libinput#Installation)
- [ACPI Events](https://wiki.archlinux.org/index.php/Power_management#Power_management_with_systemd)
- [Power saving](https://wiki.archlinux.org/index.php/Power_management#Power_saving)
