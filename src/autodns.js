var xml2js = require('xml2js')


function AutoDNS (opts) {
	this.url = opts.url || 'https://gateway.autodns.com'
	this.defaults = {
		language: opts.language || 'en',
		auth: {
			user: opts.user,
			password: opts.password
		}
	}

	this.builder = new xml2js.Builder(opts.xmlBuilder)
	this.parser = new xml2js.Parser(opts.xmlParser)
}


// AutoDNS.prototype.setZoneMain = function (main) {
// 	var zone = this.defaults.zone = this.defaults.zone || {}
// 	zone.ns_action = zone.ns_action || 'complete'
// 	zone.main = {
// 		value: main.value || main,
// 		ttl: main.ttl || '86400'
// 	}
// }

AutoDNS.prototype.setZoneSOA = function (soa) {
	var zone = this.defaults.zone = this.defaults.zone || {}
	zone.ns_action = zone.ns_action || 'complete'
	zone.soa = {}

	if (+soa.level) {
		zone.soa.level = soa.level
	}
	else if (soa.ttl || soa.refresh || soa.retry || soa.expire) {
		zone.soa.level = '0'
		// Default to recommended settings from AutoDNS docs
		zone.soa.ttl = soa.ttl || '86400'
		zone.soa.refresh = soa.refresh || '43200'
		zone.soa.retry = soa.retry || '7200'
		zone.soa.expire = soa.expire || '1209600'
	}
	else {
		zone.soa.level = '1'
	}

	if ('ignore' in soa) zone.soa.ignore = soa.ignore
	if ('email' in soa) zone.soa.email = soa.email
}

AutoDNS.prototype.setZoneNameservers = function (nameservers) {
	var zone = this.defaults.zone = this.defaults.zone || {}
	zone.nserver = nameservers.map(function (ns) {
		var nameserver = {
			name: ns.name || ns
		}
		if (ns.ttl) nameserver.ttl = ns.ttl
		return nameserver
	})
}


AutoDNS.prototype.createZone = function (name, records) {
	var zone = {
		name: name
	}
	if (records) zone.rr = records

	if ('zone' in this.defaults) {
		var defaults = this.defaults.zone
		;['main', 'ns_action', 'soa', 'nserver'].forEach(function (key) {
			if (key in defaults) {
				zone[key] = defaults[key]
			}
		}.bind(this))
	}

	return this.builder.buildObject({
		request: {
			auth: this.defaults.auth,
			language: this.defaults.language,
			task: {
				code: '0201',
				zone: zone
			}
		}
	})
}

AutoDNS.prototype.updateZone = function () {
	
}

AutoDNS.prototype.deleteZone = function () {

}


module.exports = AutoDNS
