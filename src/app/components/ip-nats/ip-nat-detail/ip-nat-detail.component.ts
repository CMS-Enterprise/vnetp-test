import { Component, OnInit } from '@angular/core';
import { AutomationApiService } from 'src/app/services/automation-api.service';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-ip-nat-detail',
  templateUrl: './ip-nat-detail.component.html',
  styleUrls: ['./ip-nat-detail.component.css']
})
export class IpNatDetailComponent implements OnInit {

  constructor(private automationApiService: AutomationApiService,
              private route: ActivatedRoute, private router: Router, private toastr: ToastrService) {
    this.ipnat = {};
  }

  Id = '';
  ipnat: any;

  ngOnInit() {
    this.Id += this.route.snapshot.paramMap.get('id');
    this.getIpNats();
  }

  // Device 42 doesn't have an endpoint to receive a specific IP NAT, therefore we will
  // retrieve all IP NATs and then find the matching one in the resulting array.
  getIpNats() {
    this.automationApiService.getIpNats().subscribe(
      data => this.getIpNat(data),
      error => {}
    );
  }

  getIpNat(ipnats: any) {
    this.ipnat = ipnats.ipnats.find(i => i.id === parseInt(this.Id));
  }

  deleteIpNat() {
      const body = {
        extra_vars: `{\"ipnat\": ${JSON.stringify(this.ipnat)}}`
      };

      this.automationApiService.launchTemplate('delete_asa_ipnat', body, true).subscribe(
        () => this.toastr.warning('Deleting Network Address Translation')
      );
    }

}
