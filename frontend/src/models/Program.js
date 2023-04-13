import { httpGet, apify } from "helpers/network";
import { getLocalData, setLocalData, spaceToDash } from "helpers/common";

class Program {
  //
  constructor(params) {
    this.params = params;
  }

  //
  async get() {
    return new Promise((resolve, reject) => {
      let programUuid = this.params['programUuid'];
      httpGet(apify(`app/program/?programUuid=${programUuid}`)).then(res => {
        this.params['program'] = res['program'];
        resolve(this.params);
      });
    });
  }

  //
  async getConfig() {
    const useMemoeryRef = true;
    let configFromMemory = getLocalData('appConfig');
    if (useMemoeryRef && configFromMemory) { return configFromMemory; }

    let config = await httpGet(apify(`app/config`));
    setLocalData('appConfig', config['config']);

    return config['config'];
  }

  //
  async impactRatings() {
    let config = await this.getConfig();
    let ratings = config['impactOptions'];
    let ratingOptions = [];
    ratings.forEach(rating => {
      ratingOptions.push({
        label: rating,
        value: rating,
      });
    });
    return ratingOptions;
  }
  //
  async impactRatingsColor(value) {
    let config = await this.getConfig();
    let ratings = config['impactRatingMapping'];
    let data = null

    ratings['Output'].map(map => {
      if(map['Impact'] === value){
        data = map['Color']
      }
      return null
    })
    return data;
  }

  //
  async riskMapping() {
    let config = await this.getConfig();
    var riskMapping = config['impactRatingMapping'];
    return riskMapping;
  }

  //
  async riskMappingColor(value) {
    let config = await this.getConfig();
    var riskMapping = config['riskValueMapping'];
   
    let data = null

    riskMapping['Mapping'].map(map => {
      if(map['Value'] === value){
        data = map['Color']
      }
      return null
    })
    return data;
  }

  

  

  // Calculate Impact Rating of Asset + Cyber Security Violation
  async calculateImpactRating(impactRatings) {
    // Get risk mapping
    let riskMapping = await this.riskMapping();
    // Input Risk Mapping
    let inputRiskMapping = riskMapping['Input'];

    // Max. Array
    let maxArray = [];

    // Iterative UI Ratings
    for (let type in impactRatings) {
      let value = impactRatings[type];
      let ratingKey = `${type}-${value}`;

      // Check key and store value in Max-Array
      inputRiskMapping.forEach(inputMapType => {
        if (inputMapType['Value'] === ratingKey) {
          maxArray.push(inputMapType['Weight']);
          return;
        }
      });
    }

    // Get max. from array
    var maxOfArray = Math.max(...maxArray);

    // Output Risk Mapping 
    let outputRiskMapping = riskMapping['Output'];
    let outputImpact = undefined;

    // Computed Impact Rating
    outputRiskMapping.forEach(outputMapType => {
      if (outputMapType['Value'] === maxOfArray) {
        outputImpact = outputMapType;
        return;
      }
    });

    //
    return outputImpact;
  }

  //
  async attackStepFeasibilityRatingMapping() {
    let config = await this.getConfig();
    var mapping = config['attackStepFeasibilityMapping'];

    return mapping;
  }
  //
  async attackStepFeasibilityRatingMappingColor(value) {
    let config = await this.getConfig();
    var mapping = config['attackStepFeasibilityMapping'];

    let data = null

    mapping['Output'].map(map => {
      if(map['Impact'] === value){
        data = map['Color']
      }
      return null
    })
    return data;
  }

  //
  async calculateAttackStepFeasibilityRating(params, impactRating, useSeclRating=false) {
    let attackStepFeasibilityRatingMapping = await this.attackStepFeasibilityRatingMapping();
    
    let sumOfArray = 0;
    let attackFeasibilityRating = {};

    var breakInternalLoop = false;

    // Input-matrix (AFR)  
    attackStepFeasibilityRatingMapping['Input'].forEach(inputMapping => {
      for (var inputFromUi in params) {
        if (inputFromUi === inputMapping['Value']) {
          sumOfArray += inputMapping['Weight'];
          breakInternalLoop = true;
          break;
        }
      }
      if (breakInternalLoop) { return; }
    });

    // Output-matrix (AFR)
    attackStepFeasibilityRatingMapping['Output'].forEach(outputMapping => {
      if (sumOfArray === outputMapping['Value']) {
        attackFeasibilityRating['Weight'] = sumOfArray;
        attackFeasibilityRating = outputMapping;
        return;
      }
    });

    // Impact Rating
    attackFeasibilityRating['Impact-Rating'] = {
      'Value': impactRating,
      'Color': await this.impactRatingsColor(impactRating),
    };

    // Risk Value Mapping
    let riskValueMapping = await this.riskValueMapping();
    let riskKey = `${spaceToDash(attackFeasibilityRating['Impact'])}-${impactRating}`;

    riskValueMapping['Mapping'].forEach(riskMatrix => {
      if (riskKey === riskMatrix['Key']) {
        attackFeasibilityRating['Risk-Value'] = riskMatrix;
        return;
      }
    });

    // SeCL ratings
    attackFeasibilityRating['SeCL'] = {
      'Value': 'N/A',
      'Color': '#CEFAD0',
    }

    if (useSeclRating) {
      let seclMapping = await this.seclMapping();
      let seclKey = `${spaceToDash(params['Required-Resources'])}-${params['Required-Knowhow']}-${params['Threat-Level']}`;

      // SeCL rating override
      seclMapping['Mapping'].forEach(seclMap => {
        if (seclMap['Key'] === seclKey) {
          attackFeasibilityRating['SeCL'] = seclMap;
          return;
        }
      });
    }
    
    return attackFeasibilityRating;
  }

  // SeCL Mapping Matrix
  async seclMapping() {
    let config = await this.getConfig();
    var mapping = config['seclMapping'];
    return mapping;
  }

  // Risk Value Mapping Matrix
  async riskValueMapping() {
    let config = await this.getConfig();
    var mapping = config['riskValueMapping'];
    return mapping;
  }

  // CAL Value Mapping Matrix
  async calValueMapping() {
    let config = await this.getConfig();
    var mapping = config['calValueMapping'];
    return mapping;
  }

  // CAL Value Color
  async calValueMappingColor(value) {
    let config = await this.getConfig();
    var mapping = config['calValueMapping'];
    let data = null;
    mapping['Mapping'].map(map => {
      if(map['Value'] === value){
        data = map['Color']
      }
      return null;
    })
    return data;
  }

  // Max-pickup from AFR
  maxAttackFeasibilityRating(ratingArray) {
    let maxPreference = undefined;
    let preferences = ['High', 'Low', 'Very Low'];
    preferences.forEach(preference => {
      if ((maxPreference === undefined) && ratingArray.includes(preference)) {
        maxPreference = preference;
      }
    });
    return maxPreference;
  }

  // Calculate CAL 
  async calculateCalLevel(threat) {
    let calValueMapping = await this.calValueMapping();
    let attackFeasibilityRatings = [], seclRatings = [];
    let impactRatingValue = threat['Impact-Rating-Value'];
    let calKey = undefined;
    let calMappingKey = 'Mapping';

    threat['Attack-Steps'].forEach(step => {
      attackFeasibilityRatings.push(step['Attack-Step-Attack-Feasibility-Rating']);
      seclRatings.push(step['Attack-Step-Security-Leval-Rating']);
    });
    
    if (threat['Prefer-SeCL-Ratings']) {
      calMappingKey = 'Mapping-SeCL';
      let maxSeCLRating = this.maxSeCLRating(seclRatings);
      calKey = `${spaceToDash(maxSeCLRating)}-${impactRatingValue}`;
    }
    
    else {
      let maxAttackFeasibilityRating = this.maxAttackFeasibilityRating(attackFeasibilityRatings);
      calKey = `${spaceToDash(maxAttackFeasibilityRating)}-${impactRatingValue}`;
    }
    
    var calLevel = {};
    calValueMapping[calMappingKey].forEach(calMatrix => {
      if (calKey === calMatrix['Key']) {
        calLevel = calMatrix;
        return;
      }
    });


    if (!calKey || !calLevel['Value']) {
      const DEFAULT_CAL_VALUE = {
        "Key": undefined,
        "Value": "QM (Key-Missing)",
        "Color": "#C6E0B4"
      };
      return DEFAULT_CAL_VALUE;
    }

    return calLevel;
  }

  // Max-pickup from SeCL
  maxSeCLRating(ratingArray) {
    ratingArray = ratingArray.map(r => {
      r = parseInt(r, 10);
      return r;
    });
    let maxRating = Math.max.apply(null, ratingArray);
    let ratingMap = {
      0: 'Very Low',
      1: 'Very Low',
      2: 'Low',
      3: 'Medium',
      4: 'High',
    };
    return ratingMap[maxRating];
  }

  async calculateRiskvalue(threat) {
    let riskValueMapping = await this.riskValueMapping();
    let attackFeasibilityRatings = [];

    threat['Attack-Steps'].forEach(step => {
      let stepAfr = step['Attack-Step-Attack-Feasibility-Rating'];
      attackFeasibilityRatings.push(stepAfr);
    });

    let maxAttackFeasibilityRating = this.maxAttackFeasibilityRating(attackFeasibilityRatings);
    let impactRatingValue = threat['Impact-Rating-Value'];

    var riskValue = {};

    let riskKey = `${spaceToDash(maxAttackFeasibilityRating)}-${impactRatingValue}`;

    riskValueMapping['Mapping'].forEach(riskMatrix => {
      if (riskKey === riskMatrix['Key']) {
        riskValue = riskMatrix;
        return;
      }
    });

    return riskValue;
  }
  
  async calculateFeasibilityRating(threat) {
    let attackFeasibilityRatings = [];
    threat['Attack-Steps'].forEach(step => {
      let stepAfr = step['Attack-Step-Attack-Feasibility-Rating'];
      attackFeasibilityRatings.push(stepAfr);
    });
    let maxAttackFeasibilityRating = this.maxAttackFeasibilityRating(attackFeasibilityRatings);
    return maxAttackFeasibilityRating;
  }

};

export default Program;