*Based on [this article](https://matteocroce.medium.com/windows-as-qemu-guest-a115a56043b6) and the 4chan /fwt/ windows install guide.*

# Windows as QEMU guest

This page will cover how to install Windows on a virtual machine using KVM and QEMU. Running stable and performant.

### Prerequisites

Install libvirt, qemu and virt-manager and procure a Windows ISO at your nearest mongolian basket weaving forum.

Now get the 'Stable virtio-win' drivers for Windows from https://github.com/virtio-win/virtio-win-pkg-scripts/blob/master/README.md

Put both the ISO in a libvirt pool directory, like `/var/lib/libvirt/images/`.

### Prepare the VM

Create a new VM via the virt-manager wizard. Select the Windows ISO as install media and select the “Customize configuration before install” option.

To change the VM definition to use the VirtIO drivers, go to the disk drive and set the bus to VirtIO. In the advanced options, set “discard mode” to unmap, to get rid of the virtualized TRIM command and discard the free space in the guest filesystem from the host.

To be able to install the VirtIO drivers during setup, add a secondary optical drive, with the virtio driver ISO you downloaded.

Now just click on “Begin Installation”.

### Windows installation

At this point the VM starts with the Windows installation running from the optical drive, until it stops because no disk drives are detected.

Press the “load driver” button, and browse `E:\viostor\w10\amd64` to find the storage drivers for the virtio disk. At this point, Windows should detect the virtio bus, and list the drive you created. Proceed to install it.

Again, use the load driver function to install the network card at `E:\NetKVM\w10\amd64`.

Optionally, you can load the virtualized GPU drivers using the load driver function as well. They are located at `E:\qxldod\w10\amd64`.

Now you can start the installation, if you want to avoid having to log in, use the 'Domain Join Instead' option. Wait for the install to complete.

### System setup

After you boot into Windows find the root of the virtio driver CD. A convenient installer for all the virtio drivers and the guest agent is there. The guest agent allows to sync the clipboard between the host and guest.

### Saving space

To maximize disk space, you can take some additional steps.

Windows keeps a *hiberfil.sys* file as big as the system ram to support hibernation. It’s unlikely to use hibernation in a VM, given they can be paused, so disable it by running in an administrator command prompt `powercfg -h off`.

More free space can be gained by running the cleanup tool:
configure it once with `cleanmgr /sageset:0` and select all the checkboxes
then run it every time with `cleanmgr /sagerun:0`

Windows update stores some backup data to rollback upgrades. Again, it’s unlikely to need it since there's VM snapshots, so this data can be freed by running in an administrator command prompt:
`dism.exe /online /Cleanup-Image /StartComponentCleanup /ResetBase`

After we’ve done with all the cleaning, run the Optimize Drive utility from Explorer. Windows will detect the drive as “thin provisioned drive” and issue discards to the host instead of regular disk defragmenting.

After the trim is done, we should have that the disk image in the host is a sparse file, with the real size being much lower than the apparent one:

```
root@turbo:/var/lib/libvirt/images# ll win10.qcow2
-rw — — — -. 1 root root 101G ott 27 02:23 win10.qcow2

root@turbo:/var/lib/libvirt/images# du -sh win10.qcow2
13G win10.qcow2
```

### Activating

Open the Windows Security app and go to Virus & Threat Protection. Select 'Manage Settings'.

Disable Real-time protection, Cloud-delivered protection and Automatic sample submission.

* Download 7-zip.
* Download the KMS_VL_ALL AIO version [from this link.](https://pastebin.com/cpdmr6HZ)
* Extract files and run it as administrator.
* At the menu, press `2` and wait.
* When done, press `0` or simply close the window. Reenable Windows Security protections.

## Debloat & Remove Telemetry

Download, install and run Privatezilla, leave the default options checked and also select the Cortana category. Click `Apply selected` and you are done.

## Passthrough

Coming soon... :)