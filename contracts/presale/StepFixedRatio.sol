//SPDX-License-Identifier: Unlicense
pragma solidity ^0.7.0;


contract StepFixedRatio {

  struct DurationRatio {
      uint256 duration;
      uint256 ratio; // uint wei
  }

  DurationRatio[] public ratios; // ordered duration

  function addDurationMax(uint256 _duration, uint256 _ratio)
  public {

      require(_duration > 0 && _ratio > 0, "StepFixedRatio: input is zero.");

      // check same duration
      require(getRatioByDuration(_duration) == 0 , "StepFixedRatio: _duration is already added.");

      if (ratios.length > 0) {
        require(ratios[ratios.length-1].duration < _duration, "StepFixedRatio: _duration is not max value");
      }

      ratios.push(DurationRatio(_duration, _ratio));

  }

  function getRatioByDuration(uint256 _duration) public view returns (uint256 ratio) {
      for (uint256 i = 0; i < ratios.length; i++) {
        if (ratios[i].duration >= _duration){
          return  ratios[i].ratio;
        }
      }
      return 0;
  }

  function getRatioByIndex(uint256 _index) public view returns (uint256 ratio) {
      require(_index < ratios.length);
      return ratios[_index].ratio;
  }

  function calculateAmountWithRatioByDuration(uint256 _amount, uint256 _duration)
    public view returns (uint256 newAmount) {
      newAmount = 0;
      for (uint256 i = 0; i < ratios.length; i++) {
        if (ratios[i].duration >= _duration){
          newAmount = _amount * ratios[i].ratio / 10**18;
        }
      }
  }

  function calculateAmountWithRatioByIndex(uint256 _amount, uint256 _index)
    public view returns (uint256 newAmount) {
      newAmount = 0;
      require(_index < ratios.length);
      newAmount = _amount * ratios[_index].ratio / 10**18;
  }

}
