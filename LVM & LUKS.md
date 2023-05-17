# Arch + LVM/LUKS Guide

## Disk Partitioning

The steps for partioning the disk are slightly different when using LVM.

With LVM you can just use one partition for the entire device you wish to use, this partition is a PV (Physical Volume). It can be grouped with other PVs in what's called a VG (Volume Group). The VG forms the pool of disk space on which you can "partition" into an LG (Logical Volume). A typical LVM user has multiple LGs which are roughly analogous to a normal partition. Except LVM allows easy resizing of partitions to fit the user's needs.

- First, determine if an /efi partition already resides on the disk. If so, you can't use it with LVM, as other operating systems (notably Windows) have no support for LVM. If there isn't one, you have to create a normal partition to hold the bootloader `/boot` and another normal partition for LVM as instructed.

- My partition scheme with LVM will be as follows:
  ```
  /boot - 200M
  /efi - 100M
  [SWAP] - If hybernation is needed, the size of RAM or double. If not, half of RAM should suffice.
  / - 80 GB
  /home - Remainder of space
  ```
- After partitioning you can now start using LVM. To create a PV on a partition run:
  ```
  pvcreate /dev/sda2
  ```
- Check pvs with the command:
  ```
  pvs
  ```
- Repeat the pv creation process for every non-boot/efi hard disk you have/wish to use.
- Now you can group your PVs into a VG:
  ```
  vgcreate GroupName /dev/sda2 /dev/sdaX /dex/sdbX ...
  ```
- Finally, this is the "partitioning" step, create your LVs by specifying their size, the VG they are part of and their name:
- Starting with SWAP:
  ```
  lvcreate -L 8G GroupName -n swap
  ```
- Now root:
  ```
  lvcreate -L 80G GroupName -n root
  ```
- And home, use `+100%FREE` to use the remainder of the space in the VG:
  ```
  lvcreate -l +100%FREE GroupName -n home
  ```
- Now you can format the LVs with a filesystem:
  ```
  mkswap -L SWAP /dev/GroupName/swap
  swapon /dev/GroupName/swap
  mkfs.ext4 -L ROOT /dev/GroupName/root
  mkfs.ext4 -L HOME /dev/GroupName/home
  mkfs.ext4 -L BOOT /dev/sdXX # boot
  mkfs.fat -F32 /dev/sdYY # efi
  ```
- And mount them:
  ```
  mount /dev/GroupName/root /mnt
  mkdir /mnt/boot
  mkdir /mnt/efi
  mkdir /mnt/home
  mount /dev/sdYY /mnt/boot
  mount /dev/sdXX /mnt/efi
  mount /dev/GroupName/home /mnt/home
  ```
  You can use the `lsblk -f` command to verify that your partitions have been mounted correctly.

That's it for partitioning the drive.

## Partitioning with encryption

- In the case of encryption however, the steps change slightly. Only one proper partition is created at first, along with the boot partition, which is left unencrypted.
- The non-boot partition is encrypted:
  ```
  cryptsetup luksFormat /dev/sda2
  ```
- And then opened for modifications:
  ```
  cryptsetup open /dev/sda2 CryptPartitionName
  ```
- The steps for LVM are then done on top of CryptPartitionName. Which can be found at `/dev/mapper/CryptPartitionName`

## mkinitcpio

This step is taken just before installing the bootloader.

- Install `lvm2` in your chroot, if you haven't already.
- For LVM to work, a hook needs to be set in `/etc/mkinitcpio.conf` scroll down to the HOOKS section and add `lvm2` to the array before `filesystems`.
- If using encryption things are a little different. If using the `encrypt` hook (do not add '[!]' that's just marking the hooks you need):
  ```
  HOOKS=(base udev autodetect keyboard[!] keymap[!] consolefont[!] modconf block encrypt[!] lvm2[!] filesystems fsck)
  ```
- If using `sd-encrypt`, which uses systemd:
  ```
  HOOKS=(base systemd[!] autodetect keyboard[!] sd-vconsole[!] modconf block sd-encrypt[!] lvm2[!] filesystems fsck)
  ```
- Now run:
  ```
  mkinitcpio -p linux
  ```

## Decrypt with 'encrypt' hook

- Special configuration is needed for booting with LUKS. Grab your `/dev/sda2` UUID and open `/etc/default/grub` for editing, adding the following line in `GRUB_CMDLINE_LINUX`, changing ID_HERE with the actual UUID:
  ```
  cryptdevice=UUID=ID_HERE:CryptPartitionName root=/dev/GroupName/root
  ```
- Then regenerate GRUB config.

## Decrypt with 'sd-encrypt' hook

- Grab your `/dev/sda2` UUID and open `/etc/default/grub` for editing, adding the following line in `GRUB_CMDLINE_LINUX`, changing ID_HERE with the actual UUID:
  ```
  rd.luks.name=ID_HERE=CryptPartitionName root=/dev/GroupName/root
  ```
- Then regenerate GRUB config.
- Unlike `encrypt`, `sd-encrypt` supports unlocking multiple devices, to do this, simply repeat `rd.luks.name=` for the other devices.

## Useful links

[LVM on LUKS](https://wiki.archlinux.org/title/Dm-crypt/Encrypting_an_entire_system#LVM_on_LUKS)

[Resizing LVM on LUKS](https://wiki.archlinux.org/title/Resizing_LVM-on-LUKS)

[How to boot an encrypted system.](https://wiki.archlinux.org/title/Dm-crypt/System_configuration)
